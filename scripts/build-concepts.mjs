/**
 * Phase 13A/13B — build concept data model + static page JSON for routes.
 *
 * Source of truth:
 * - docs/concepts.json defines which concepts exist, coverage, slug, origin
 * - public/content/search-index.json + lesson page JSON resolve live resource refs
 *
 * Writes:
 * - public/content/concepts.json (model)
 * - public/content/pages/concepts.json (index route)
 * - public/content/pages/concepts/<slug>.json (detail routes)
 * - relatedConcepts chips on linked lesson/example/interview pages
 * - concept entries appended to public/content/search-index.json
 * - updates public/sitemap.xml with /concepts URLs
 *
 * No final concept UI redesign (13C) and no Phase 14 content work.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DISCOVERY = join(ROOT, 'docs', 'concepts.json')
const SEARCH = join(ROOT, 'public', 'content', 'search-index.json')
const PAGES = join(ROOT, 'public', 'content', 'pages')
const OUT = join(ROOT, 'public', 'content', 'concepts.json')
const SITEMAP = join(ROOT, 'public', 'sitemap.xml')
const SITE = (process.env.VITE_SITE_URL || 'https://javamastery.srinivasrao.co.in').replace(/\/$/, '')
if (!/^https?:\/\/[^/]+$/.test(SITE)) {
  throw new Error(`VITE_SITE_URL must be an origin without a path: ${SITE}`)
}

const MAX_INTERVIEWS = 25
const MAX_LEETCODE = 15
const MAX_VERSIONS = 12

function norm(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function flat(value) {
  return norm(value).replace(/ /g, '')
}

function tokenMatch(a, b) {
  if (a === b) return true
  if (a.length < 2 || b.length < 2) return false
  return a === `${b}s` || b === `${a}s` || a === `${b}es` || b === `${a}es`
}

function includesConcept(text, concept) {
  const n = norm(text)
  const c = norm(concept)
  if (!n || !c) return false
  const hay = n.split(' ').filter(Boolean)
  const needle = c.split(' ').filter(Boolean)
  for (let i = 0; i <= hay.length - needle.length; i += 1) {
    if (needle.every((part, j) => tokenMatch(hay[i + j], part))) return true
  }
  const cf = flat(concept)
  const nf = flat(text)
  return cf.length >= 6 && nf.includes(cf)
}

function strongDoc(doc, concept) {
  if (includesConcept(doc.title, concept)) return true
  if (doc.file && includesConcept(doc.file, concept)) return true
  if (Array.isArray(doc.keywords) && doc.keywords.some((key) => includesConcept(key, concept))) return true
  // LeetCode APPROACH lines land in description — allow hash-map evidence there only.
  if (doc.type === 'leetcode' && doc.description && includesConcept(doc.description, concept)) return true
  return false
}

function walkPages(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walkPages(full, acc)
    else if (name.endsWith('.json')) acc.push(full)
  }
  return acc
}

function pageUrlFromFile(file) {
  const rel = relative(PAGES, file).replace(/\\/g, '/')
  if (rel === 'home.json') return '/'
  return `/${rel.replace(/\.json$/, '')}`
}

function loadPage(url) {
  if (!url || !url.startsWith('/')) return null
  const base = url.split('#')[0]
  const file = base === '/'
    ? join(PAGES, 'home.json')
    : join(PAGES, `${base.slice(1)}.json`)
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}

function uniqRefs(list) {
  const seen = new Set()
  const out = []
  for (const item of list) {
    const key = `${item.url}\0${item.file || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function cap(list, limit) {
  return list.length <= limit ? list : list.slice(0, limit)
}

if (!existsSync(DISCOVERY)) {
  console.error(`Missing discovery artifact: ${DISCOVERY}`)
  process.exit(1)
}
if (!existsSync(SEARCH)) {
  console.error(`Missing search index: ${SEARCH}. Run build-content first.`)
  process.exit(1)
}

const discovery = JSON.parse(readFileSync(DISCOVERY, 'utf8'))
const searchIndex = JSON.parse(readFileSync(SEARCH, 'utf8'))
const knownUrls = new Set(searchIndex.map((doc) => doc.url.split('#')[0]))
for (const file of walkPages(PAGES)) knownUrls.add(pageUrlFromFile(file))

const focusByFlat = new Map()
for (const row of discovery.focus || []) {
  focusByFlat.set(flat(row.concept), row)
}

/** Aliases from Phase 13 architecture (deterministic renames only). */
const ALIASES = {
  strings: ['String'],
  stream: ['Streams'],
}

const sliceSeeds = (discovery.inventory || []).filter((row) => row.coverage === 'A' || row.coverage === 'B')
if (sliceSeeds.length === 0) {
  console.error('No A/B concepts found in docs/concepts.json inventory')
  process.exit(1)
}

const concepts = []
for (const seed of sliceSeeds) {
  const title = seed.concept
  const slug = seed.slug
  const id = `concept:${slug}`
  const aliases = ALIASES[slug] ? [...ALIASES[slug]] : []
  const matchTitles = [title, ...aliases]

  const buckets = {
    lessons: [],
    examples: [],
    references: [],
    interviews: [],
    leetcode: [],
    projects: [],
    versions: [],
  }
  const packages = new Set()
  const topics = new Set()

  for (const doc of searchIndex) {
    if (!matchTitles.some((name) => strongDoc(doc, name))) continue
    const ref = {
      title: doc.title,
      url: doc.url,
      ...(doc.file ? { file: doc.file } : {}),
    }
    if (doc.type === 'lesson') buckets.lessons.push(ref)
    else if (doc.type === 'example') {
      buckets.examples.push(ref)
      if (doc.pkg) packages.add(doc.pkg)
    } else if (doc.type === 'reference') buckets.references.push(ref)
    else if (doc.type === 'interview') buckets.interviews.push(ref)
    else if (doc.type === 'leetcode') buckets.leetcode.push(ref)
    else if (doc.type === 'project') buckets.projects.push(ref)
    else if (doc.type === 'version') buckets.versions.push(ref)
    if (doc.topic) topics.add(doc.topic)
  }

  // Explicit lesson graph from page JSON (related / connected).
  for (const lesson of buckets.lessons) {
    const page = loadPage(lesson.url)
    if (!page?.doc) continue
    if (page.doc.stageLabel) topics.add(page.doc.stageLabel)
    for (const example of page.doc.related || []) {
      if (!example.url) continue
      buckets.examples.push({
        title: example.className || example.path,
        url: example.url,
        ...(example.path ? { file: example.path.split('/').pop() } : {}),
      })
      if (example.pkg) packages.add(example.pkg)
    }
    const connected = page.doc.connected
    if (connected) {
      for (const item of connected.interview || []) {
        buckets.interviews.push({ title: item.title, url: item.href })
      }
      for (const item of connected.reference || []) {
        buckets.references.push({ title: item.title, url: item.href })
      }
      for (const item of connected.projects || []) {
        buckets.projects.push({ title: item.title, url: item.href })
      }
    }
  }

  // Merge explicit focus evidence when titles align.
  for (const name of matchTitles) {
    const focus = focusByFlat.get(flat(name))
    if (!focus) continue
    // Pin lessons when title matching is insufficient (e.g. HashMap → Collections chapter).
    for (const item of focus.strongLessons || []) {
      if (!item?.url) continue
      buckets.lessons.push({ title: item.title, url: item.url })
    }
    for (const item of focus.strongExamples || []) {
      if (!item?.url) continue
      buckets.examples.push({
        title: item.title,
        url: item.url,
        ...(item.file ? { file: item.file } : {}),
      })
    }
    for (const item of focus.strongLeetcodeSample || []) {
      if (!item?.url) continue
      buckets.leetcode.push({
        title: item.title,
        url: item.url,
        ...(item.file ? { file: item.file } : {}),
      })
    }
    const explicit = focus.explicitFromPrimaryLesson
    if (!explicit) continue
    for (const item of explicit.relatedExamples || []) {
      if (!item.url) continue
      buckets.examples.push({
        title: item.className || item.path,
        url: item.url,
        ...(item.path ? { file: item.path.split('/').pop() } : {}),
      })
    }
    for (const item of explicit.interview || []) {
      buckets.interviews.push({ title: item.title, url: item.href })
    }
    for (const item of explicit.reference || []) {
      buckets.references.push({ title: item.title, url: item.href })
    }
    for (const item of explicit.projects || []) {
      buckets.projects.push({ title: item.title, url: item.href })
    }
  }

  concepts.push({
    id,
    slug,
    title,
    coverage: seed.coverage,
    origin: seed.origin,
    aliases,
    lessons: uniqRefs(buckets.lessons),
    examples: uniqRefs(buckets.examples),
    references: uniqRefs(buckets.references),
    interviews: cap(uniqRefs(buckets.interviews), MAX_INTERVIEWS),
    leetcode: cap(uniqRefs(buckets.leetcode), MAX_LEETCODE),
    projects: uniqRefs(buckets.projects),
    versions: cap(uniqRefs(buckets.versions), MAX_VERSIONS),
    related: [],
    packages: [...packages].sort((a, b) => a.localeCompare(b)),
    topics: [...topics].sort((a, b) => a.localeCompare(b)),
  })
}

// Deterministic related links among the slice only (vs-patterns in interview titles).
const byFlatTitle = new Map()
for (const concept of concepts) {
  byFlatTitle.set(flat(concept.title), concept)
  for (const alias of concept.aliases) byFlatTitle.set(flat(alias), concept)
}

for (const concept of concepts) {
  const related = new Map()
  for (const interview of concept.interviews) {
    const title = interview.title
    if (!/\bvs\b/i.test(title) && !/\bversus\b/i.test(title)) continue
    for (const [key, target] of byFlatTitle) {
      if (target.id === concept.id) continue
      if (!includesConcept(title, target.title) && !target.aliases.some((alias) => includesConcept(title, alias))) {
        continue
      }
      // Require the other concept also appears as a vs peer token set — title mentions this concept too.
      if (!includesConcept(title, concept.title) && !concept.aliases.some((alias) => includesConcept(title, alias))) {
        continue
      }
      related.set(target.id, {
        id: target.id,
        kind: 'deterministic',
        evidence: `co-mentioned in interview title: ${title}`,
      })
    }
  }
  // Explicit parent/child from shared packages when both are type-name concepts under a lesson concept with that package.
  concept.related = [...related.values()].sort((a, b) => a.id.localeCompare(b.id))
}

const model = {
  version: 1,
  generatedFrom: {
    discovery: 'docs/concepts.json',
    searchIndex: 'public/content/search-index.json',
  },
  slice: 'A+B',
  concepts: concepts.sort((a, b) => a.slug.localeCompare(b.slug)),
}

// Inline validation (mirrors src/validate-concepts.ts) without importing TS from .mjs.
const ids = new Set()
const slugs = new Set()
for (const concept of model.concepts) {
  if (ids.has(concept.id)) throw new Error(`duplicate id ${concept.id}`)
  if (slugs.has(concept.slug)) throw new Error(`duplicate slug ${concept.slug}`)
  ids.add(concept.id)
  slugs.add(concept.slug)
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(concept.slug)) throw new Error(`bad slug ${concept.slug}`)
  const count = concept.lessons.length + concept.examples.length + concept.references.length
    + concept.interviews.length + concept.leetcode.length + concept.projects.length + concept.versions.length
  if (count === 0) throw new Error(`empty concept ${concept.id}`)
  for (const group of [concept.lessons, concept.examples, concept.references, concept.interviews, concept.leetcode, concept.projects, concept.versions]) {
    for (const ref of group) {
      const base = ref.url.split('#')[0]
      if (!knownUrls.has(base) && !knownUrls.has(ref.url)) {
        throw new Error(`${concept.id}: unknown url ${ref.url}`)
      }
    }
  }
  for (const rel of concept.related) {
    if (!ids.has(rel.id) && ![...model.concepts].some((item) => item.id === rel.id)) {
      // ids set filled as we go; second pass:
    }
  }
}
for (const concept of model.concepts) {
  for (const rel of concept.related) {
    if (!ids.has(rel.id)) throw new Error(`${concept.id}: missing related ${rel.id}`)
  }
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, `${JSON.stringify(model, null, 2)}\n`)
console.log(`Concept model: ${model.concepts.length} A+B concepts → ${relative(ROOT, OUT).replace(/\\/g, '/')}`)

function writePage(path, data) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${SITE}${crumb.href}`,
    })),
  }
}

function resourceCount(concept) {
  return concept.lessons.length + concept.examples.length + concept.references.length
    + concept.interviews.length + concept.leetcode.length + concept.projects.length + concept.versions.length
}

function shortText(value, max = 160) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return null
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const at = cut.lastIndexOf(' ')
  return `${(at > 80 ? cut.slice(0, at) : cut).trim()}…`
}

function docForUrl(url) {
  if (!url) return null
  return searchByUrl.get(url) || searchByUrl.get(url.split('#')[0]) || null
}

function enrichRef(ref) {
  const doc = docForUrl(ref.url)
  const context = doc?.hint || doc?.topic || null
  const description = shortText(doc?.description)
  const out = {
    title: ref.title,
    url: ref.url,
  }
  if (ref.file || doc?.file) out.file = ref.file || doc.file
  if (doc?.pkg) out.pkg = doc.pkg
  if (context) out.context = context
  if (description) out.description = description
  return out
}

function packageRole(pkg) {
  if (!pkg) return null
  const page = loadPage(`/examples/${pkg}`)
  return page?.package?.role || null
}

function cleanTopicLabel(topic) {
  return String(topic || '')
    .replace(/\s*[—-]\s*Interview Questions.*$/i, '')
    .replace(/\s*\(\d+\+?\)\s*$/, '')
    .trim()
}

function isCurriculumTopic(topic) {
  if (!topic) return false
  if (/Interview Questions|Blind\s*\d*|LeetCode|Interview\s*\d+/i.test(topic)) return false
  if (/^Java\s+\d+$/i.test(topic)) return false
  return true
}

function buildFit(concept) {
  const trail = []
  const primaryLesson = concept.lessons[0]
  if (primaryLesson) {
    const page = loadPage(primaryLesson.url)
    if (page?.doc?.stageLabel) {
      trail.push({ label: page.doc.stageLabel, href: '/learn' })
    } else {
      const topic = concept.topics.find(isCurriculumTopic)
      if (topic) trail.push({ label: cleanTopicLabel(topic), href: null })
    }
    trail.push({ label: primaryLesson.title, href: primaryLesson.url })
    return trail
  }

  const pkg = concept.packages[0]
  const role = packageRole(pkg)
  if (role) {
    trail.push({ label: role, href: `/examples/${pkg}` })
    trail.push({ label: concept.title, href: null })
    return trail
  }

  const topic = concept.topics.find(isCurriculumTopic) || concept.topics[0]
  if (topic) {
    trail.push({ label: cleanTopicLabel(topic), href: null })
    trail.push({ label: concept.title, href: null })
  }
  return trail
}

function conceptSummary(concept) {
  const lesson = concept.lessons[0]
  if (lesson) {
    const doc = docForUrl(lesson.url)
    const fromLesson = shortText(doc?.description, 220)
    if (fromLesson) return fromLesson
  }
  const example = concept.examples[0]
  if (example) {
    const doc = docForUrl(example.url)
    const fromExample = shortText(doc?.description, 220)
    if (fromExample) return fromExample
  }
  return conceptDescription(concept)
}

function conceptDescription(concept) {
  const parts = []
  if (concept.lessons.length) parts.push(`${concept.lessons.length} lesson${concept.lessons.length === 1 ? '' : 's'}`)
  if (concept.examples.length) parts.push(`${concept.examples.length} code example${concept.examples.length === 1 ? '' : 's'}`)
  if (concept.interviews.length) parts.push('interview questions')
  if (concept.leetcode.length) parts.push('LeetCode practice')
  if (concept.projects.length) parts.push('projects')
  if (concept.versions.length) parts.push('Java version notes')
  if (concept.references.length) parts.push('reference')
  const body = parts.length ? parts.join(', ') : 'existing JavaForge resources'
  return `${concept.title} in JavaForge. Links to ${body}.`.slice(0, 180)
}

function conceptSearchInventory(concept, fit, packageLabels) {
  const parts = []
  const topic = fit[0]?.label || packageLabels[0]?.role || null
  if (topic) parts.push(topic)
  if (concept.lessons.length) {
    parts.push(`${concept.lessons.length} lesson${concept.lessons.length === 1 ? '' : 's'}`)
  }
  if (concept.examples.length) {
    parts.push(`${concept.examples.length} example${concept.examples.length === 1 ? '' : 's'}`)
  }
  if (concept.interviews.length) {
    parts.push(`${concept.interviews.length} interview${concept.interviews.length === 1 ? '' : 's'}`)
  }
  if (concept.leetcode.length) {
    parts.push(`${concept.leetcode.length} practice`)
  }
  if (concept.projects.length) {
    parts.push(`${concept.projects.length} project${concept.projects.length === 1 ? '' : 's'}`)
  }
  if (concept.references.length) parts.push('reference')
  if (concept.versions.length) {
    parts.push(`${concept.versions.length} version note${concept.versions.length === 1 ? '' : 's'}`)
  }
  return parts.join(' · ').slice(0, 220)
}

const searchByUrl = new Map()
for (const doc of searchIndex) {
  searchByUrl.set(doc.url, doc)
  const base = doc.url.split('#')[0]
  if (!searchByUrl.has(base)) searchByUrl.set(base, doc)
}

const byId = new Map(model.concepts.map((concept) => [concept.id, concept]))
const allowedSlugs = new Set(model.concepts.map((concept) => concept.slug))
const conceptDir = join(PAGES, 'concepts')
if (existsSync(conceptDir)) {
  for (const name of readdirSync(conceptDir)) {
    const full = join(conceptDir, name)
    if (!statSync(full).isFile() || !name.endsWith('.json')) continue
    const slug = name.slice(0, -'.json'.length)
    if (!allowedSlugs.has(slug)) unlinkSync(full)
  }
}

const indexCrumbs = [
  { name: 'JavaForge', href: '/' },
  { name: 'Concepts', href: '/concepts' },
]
const indexItems = model.concepts.map((concept) => {
  const fit = buildFit(concept)
  const primaryTopic = fit[0]?.label || concept.topics.find(isCurriculumTopic) || null
  return {
    title: concept.title,
    slug: concept.slug,
    href: `/concepts/${concept.slug}`,
    coverage: concept.coverage,
    resources: resourceCount(concept),
    topic: primaryTopic,
    signals: {
      lesson: concept.lessons.length > 0,
      code: concept.examples.length > 0,
      interview: concept.interviews.length > 0,
      practice: concept.leetcode.length > 0,
      project: concept.projects.length > 0,
    },
  }
})
writePage(join(PAGES, 'concepts.json'), {
  robots: 'index,follow',
  kind: 'concepts',
  url: '/concepts',
  title: 'Concepts | JavaForge',
  description: 'Concept landings that link existing JavaForge lessons, code, interview material, and practice.',
  canonicalPath: '/concepts',
  breadcrumbs: indexCrumbs,
  jsonLd: breadcrumbLd(indexCrumbs),
  conceptsIndex: {
    blurb: 'Entry points into the curriculum. Each concept page links existing lessons, code, interview material, and practice — it does not replace a chapter.',
    groups: [
      {
        id: 'coverage-a',
        label: 'Coverage A',
        note: 'Strong lesson and code evidence in this slice.',
        items: indexItems.filter((item) => item.coverage === 'A'),
      },
      {
        id: 'coverage-b',
        label: 'Coverage B',
        note: 'Good evidence; often interview-led or type-focused.',
        items: indexItems.filter((item) => item.coverage === 'B'),
      },
    ],
  },
})

const conceptUrls = [`${SITE}/concepts`]
for (const concept of model.concepts) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(concept.slug)) {
    throw new Error(`unsafe concept slug for route: ${concept.slug}`)
  }
  const href = `/concepts/${concept.slug}`
  const crumbs = [
    { name: 'JavaForge', href: '/' },
    { name: 'Concepts', href: '/concepts' },
    { name: concept.title, href },
  ]
  const related = concept.related.map((rel) => {
    const target = byId.get(rel.id)
    if (!target) throw new Error(`${concept.id}: related missing for page emit ${rel.id}`)
    return {
      title: target.title,
      href: `/concepts/${target.slug}`,
      kind: rel.kind,
      evidence: rel.evidence,
    }
  })
  const fit = buildFit(concept)
  const packageLabels = concept.packages
    .map((pkg) => ({ pkg, role: packageRole(pkg) }))
    .filter((row) => row.role)
  writePage(join(PAGES, 'concepts', `${concept.slug}.json`), {
    robots: 'index,follow',
    kind: 'concept',
    url: href,
    title: `${concept.title} | JavaForge`,
    description: conceptDescription(concept),
    canonicalPath: href,
    breadcrumbs: crumbs,
    jsonLd: breadcrumbLd(crumbs),
    conceptPage: {
      slug: concept.slug,
      title: concept.title,
      coverage: concept.coverage,
      aliases: concept.aliases,
      summary: conceptSummary(concept),
      fit,
      packages: concept.packages,
      packageLabels,
      topics: concept.topics.filter(isCurriculumTopic),
      groups: {
        lessons: concept.lessons.map(enrichRef),
        examples: concept.examples.map(enrichRef),
        references: concept.references.map(enrichRef),
        interviews: concept.interviews.map(enrichRef),
        leetcode: concept.leetcode.map(enrichRef),
        projects: concept.projects.map(enrichRef),
        versions: concept.versions.map(enrichRef),
      },
      related,
    },
  })
  conceptUrls.push(`${SITE}${href}`)
}

// Reverse map: curriculum page URL → concept landings that list it.
const relatedByUrl = new Map()
function rememberRelated(url, concept) {
  if (!url || !url.startsWith('/')) return
  const base = url.split('#')[0]
  const entry = { title: concept.title, href: `/concepts/${concept.slug}` }
  for (const key of base === url ? [base] : [base, url]) {
    const list = relatedByUrl.get(key) || []
    if (!list.some((item) => item.href === entry.href)) list.push(entry)
    relatedByUrl.set(key, list)
  }
}
for (const concept of model.concepts) {
  for (const ref of [
    ...concept.lessons,
    ...concept.examples,
    ...concept.references,
    ...concept.interviews,
    ...concept.leetcode,
    ...concept.projects,
    ...concept.versions,
  ]) {
    rememberRelated(ref.url, concept)
  }
}

for (const file of walkPages(PAGES)) {
  const rel = relative(PAGES, file).replace(/\\/g, '/')
  if (rel === 'concepts.json' || rel.startsWith('concepts/')) continue
  const page = JSON.parse(readFileSync(file, 'utf8'))
  if (page.kind !== 'doc' && page.kind !== 'example') {
    if (page.relatedConcepts) {
      delete page.relatedConcepts
      writePage(file, page)
    }
    continue
  }
  const related = relatedByUrl.get(page.url) || []
  if (related.length) {
    page.relatedConcepts = related.sort((a, b) => a.title.localeCompare(b.title))
    writePage(file, page)
  } else if (page.relatedConcepts) {
    delete page.relatedConcepts
    writePage(file, page)
  }
}

// Append concept search documents (one per A/B concept). Rebuild from content index without prior concepts.
const baseSearch = searchIndex.filter((doc) => doc.type !== 'concept')
const conceptSearchDocs = model.concepts.map((concept) => {
  const fit = buildFit(concept)
  const packageLabels = concept.packages
    .map((pkg) => ({ pkg, role: packageRole(pkg) }))
    .filter((row) => row.role)
  const inventory = conceptSearchInventory(concept, fit, packageLabels)
  return {
    id: `concept:${concept.slug}`,
    type: 'concept',
    title: concept.title,
    url: `/concepts/${concept.slug}`,
    description: inventory,
    hint: inventory,
    topic: fit[0]?.label || packageLabels[0]?.role || undefined,
    keywords: [
      concept.slug,
      concept.title,
      ...concept.aliases,
      ...concept.packages,
    ].filter(Boolean),
  }
})
const conceptIds = new Set(conceptSearchDocs.map((doc) => doc.id))
if (conceptIds.size !== conceptSearchDocs.length) throw new Error('Duplicate concept search ids')
const conceptSearchUrls = new Set(conceptSearchDocs.map((doc) => doc.url))
if (conceptSearchUrls.size !== conceptSearchDocs.length) throw new Error('Duplicate concept search urls')
const mergedSearch = [...baseSearch, ...conceptSearchDocs]
writeFileSync(SEARCH, `${JSON.stringify(mergedSearch)}\n`)
console.log(`Concept search: ${conceptSearchDocs.length} concept docs → search-index ${mergedSearch.length} total`)

if (!existsSync(SITEMAP)) throw new Error('sitemap.xml missing — run build-content first')
const sitemapText = readFileSync(SITEMAP, 'utf8')
const existing = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const withoutConcepts = existing.filter((loc) => loc !== `${SITE}/concepts` && !loc.startsWith(`${SITE}/concepts/`))
const merged = [...withoutConcepts, ...conceptUrls]
if (new Set(merged).size !== merged.length) throw new Error('Duplicate sitemap URLs after adding concepts')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${merged.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(SITEMAP, sitemap)
console.log(`Concept routes: ${1 + model.concepts.length} pages, sitemap ${merged.length} URLs`)
