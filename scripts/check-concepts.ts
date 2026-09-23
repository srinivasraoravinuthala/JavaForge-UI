import { existsSync, readFileSync } from 'node:fs'
import {
  ConceptValidationError,
  conceptIdFromSlug,
  isValidConceptSlug,
  validateConceptModel,
  type ConceptModel,
} from '../src/concepts.ts'

const failures: string[] = []

function expect(name: string, ok: boolean) {
  if (!ok) failures.push(name)
}

function expectThrows(name: string, fn: () => void) {
  try {
    fn()
    failures.push(name)
  } catch (error) {
    if (!(error instanceof ConceptValidationError)) failures.push(`${name}: wrong error`)
  }
}

if (!existsSync('public/content/concepts.json')) {
  console.error('public/content/concepts.json missing — run build-concepts after build-content')
  process.exit(1)
}

const raw = JSON.parse(readFileSync('public/content/concepts.json', 'utf8')) as ConceptModel
const search = JSON.parse(readFileSync('public/content/search-index.json', 'utf8')) as { url: string }[]
const knownUrls = new Set(search.map((doc) => doc.url.split('#')[0]))

let model: ConceptModel
try {
  model = validateConceptModel(raw, { knownUrls, requireSliceOnly: true })
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

expect('slice size', model.concepts.length >= 20 && model.concepts.length <= 30)
expect('all A or B', model.concepts.every((concept) => concept.coverage === 'A' || concept.coverage === 'B'))

const strings = model.concepts.find((concept) => concept.slug === 'strings')
expect('strings present', Boolean(strings))
expect('strings has lesson', (strings?.lessons.length || 0) >= 1)
expect('strings has example', (strings?.examples.length || 0) >= 1)
expect('strings alias', Boolean(strings?.aliases.includes('String')))
expect('strings lesson url resolves', Boolean(strings && knownUrls.has(strings.lessons[0].url.split('#')[0])))

const hashmap = model.concepts.find((concept) => concept.slug === 'hashmap')
expect('hashmap present', Boolean(hashmap))
expect('hashmap interviews', (hashmap?.interviews.length || 0) >= 1)
expect('hashmap has lesson', (hashmap?.lessons.length || 0) >= 1)
expect('hashmap has example', (hashmap?.examples.length || 0) >= 1)
expect('hashmap optional lesson ok', Array.isArray(hashmap?.lessons))
expect('hashmap collections lesson', Boolean(hashmap?.lessons.some((ref) => ref.url.includes('17-Collections'))))
expect('hashmap key-contract demo', Boolean(hashmap?.examples.some((ref) => /core29HashMapDemo/i.test(ref.file || ref.url || ref.title))))
expect('hashmap practice', (hashmap?.leetcode.length || 0) >= 3)

const concurrency = model.concepts.find((concept) => concept.slug === 'concurrency')
expect('concurrency examples', (concurrency?.examples.length || 0) >= 1)

expect('unique ids', new Set(model.concepts.map((concept) => concept.id)).size === model.concepts.length)
expect('unique slugs', new Set(model.concepts.map((concept) => concept.slug)).size === model.concepts.length)
expect('id slug contract', model.concepts.every((concept) => concept.id === conceptIdFromSlug(concept.slug)))
expect('slug shape', model.concepts.every((concept) => isValidConceptSlug(concept.slug)))

expectThrows('reject duplicate ids', () => {
  const clone = structuredClone(model)
  clone.concepts.push({ ...clone.concepts[0], slug: 'zzzzdup', id: clone.concepts[0].id })
  validateConceptModel(clone, { requireSliceOnly: true })
})

expectThrows('reject duplicate slugs', () => {
  const clone = structuredClone(model)
  clone.concepts.push({ ...clone.concepts[0], id: 'concept:zzzzdup' })
  validateConceptModel(clone, { requireSliceOnly: true })
})

expectThrows('reject invalid slug', () => {
  const clone = structuredClone(model)
  clone.concepts[0] = { ...clone.concepts[0], slug: 'Bad_Slug', id: 'concept:Bad_Slug' }
  validateConceptModel(clone, { requireSliceOnly: true })
})

expectThrows('reject unknown url', () => {
  const clone = structuredClone(model)
  clone.concepts[0] = {
    ...clone.concepts[0],
    lessons: [...clone.concepts[0].lessons, { title: 'Missing', url: '/docs/does-not-exist' }],
  }
  validateConceptModel(clone, { knownUrls, requireSliceOnly: true })
})

expectThrows('reject empty concept', () => {
  const clone = structuredClone(model)
  clone.concepts[0] = {
    ...clone.concepts[0],
    lessons: [],
    examples: [],
    references: [],
    interviews: [],
    leetcode: [],
    projects: [],
    versions: [],
  }
  validateConceptModel(clone, { requireSliceOnly: true })
})

expectThrows('reject coverage C in slice', () => {
  const clone = structuredClone(model)
  clone.concepts[0] = { ...clone.concepts[0], coverage: 'C' }
  validateConceptModel(clone, { requireSliceOnly: true })
})

expect('related targets exist', model.concepts.every((concept) => (
  concept.related.every((rel) => model.concepts.some((item) => item.id === rel.id))
)))

expect('concepts index page', existsSync('public/content/pages/concepts.json'))
const indexPage = JSON.parse(readFileSync('public/content/pages/concepts.json', 'utf8')) as {
  kind: string
  url: string
  canonicalPath: string
  conceptsIndex?: {
    blurb?: string
    groups?: { id: string; items: { slug: string; href: string }[] }[]
    items?: { slug: string; href: string }[]
  }
}
expect('concepts index kind', indexPage.kind === 'concepts')
expect('concepts index url', indexPage.url === '/concepts' && indexPage.canonicalPath === '/concepts')
const indexItems = indexPage.conceptsIndex?.groups?.flatMap((group) => group.items)
  || indexPage.conceptsIndex?.items
  || []
expect('concepts index items', indexItems.length === model.concepts.length)
expect('concepts index blurb', Boolean(indexPage.conceptsIndex?.blurb))
expect('concepts index groups', (indexPage.conceptsIndex?.groups?.length || 0) >= 1)

const seenRoutes = new Set<string>(['/concepts'])
for (const concept of model.concepts) {
  const pagePath = `public/content/pages/concepts/${concept.slug}.json`
  expect(`page ${concept.slug}`, existsSync(pagePath))
  if (!existsSync(pagePath)) continue
  const page = JSON.parse(readFileSync(pagePath, 'utf8')) as {
    kind: string
    url: string
    canonicalPath: string
    title: string
    conceptPage?: { slug: string; title: string }
  }
  expect(`route ${concept.slug}`, page.url === `/concepts/${concept.slug}` && page.canonicalPath === page.url)
  expect(`kind ${concept.slug}`, page.kind === 'concept')
  expect(`title ${concept.slug}`, page.conceptPage?.title === concept.title)
  expect(`summary ${concept.slug}`, typeof (page as { conceptPage?: { summary?: string } }).conceptPage?.summary === 'string')
  if (seenRoutes.has(page.url)) failures.push(`duplicate route ${page.url}`)
  seenRoutes.add(page.url)
}

expect('unknown concept page absent', !existsSync('public/content/pages/concepts/not-a-real-concept.json'))

const optionalPage = JSON.parse(readFileSync('public/content/pages/concepts/optional.json', 'utf8')) as {
  conceptPage?: { related: { href: string; kind: string }[]; groups: { lessons: unknown[] } }
}
expect('optional related renders data', (optionalPage.conceptPage?.related.length || 0) >= 1)

const searchDocs = JSON.parse(readFileSync('public/content/search-index.json', 'utf8')) as { type: string; url: string; title: string; id: string }[]
const conceptDocs = searchDocs.filter((doc) => doc.type === 'concept')
expect('search has concept docs', conceptDocs.length === model.concepts.length)
expect('search concept urls', model.concepts.every((concept) => (
  conceptDocs.some((doc) => doc.url === `/concepts/${concept.slug}` && doc.title === concept.title)
)))
expect('search concept ids unique', new Set(conceptDocs.map((doc) => doc.id)).size === conceptDocs.length)

const stringsLesson = JSON.parse(readFileSync('public/content/pages/docs/02-learn--08-Strings.json', 'utf8')) as {
  relatedConcepts?: { title: string; href: string }[]
}
expect('strings lesson related concept', Boolean(stringsLesson.relatedConcepts?.some((item) => item.href === '/concepts/strings')))

const stringsExample = JSON.parse(readFileSync('public/content/pages/examples/pkg1core/core9StringsDemo.json', 'utf8')) as {
  relatedConcepts?: { title: string; href: string }[]
}
expect('strings example related concept', Boolean(stringsExample.relatedConcepts?.some((item) => item.href === '/concepts/strings')))

console.log(`Concept checks: ${model.concepts.length} concepts in A+B slice`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Concept model checks passed')
