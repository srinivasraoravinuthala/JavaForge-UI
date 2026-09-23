import { readFileSync, statSync } from 'fs'
import { gzipSync } from 'zlib'
import { searchDocuments, type SearchDocument } from '../src/search.ts'

const index = JSON.parse(readFileSync('public/content/search-index.json', 'utf8')) as SearchDocument[]
const raw = statSync('public/content/search-index.json').size
const gzip = gzipSync(readFileSync('public/content/search-index.json')).length
const failures: string[] = []

function expect(name: string, ok: boolean) {
  if (!ok) failures.push(name)
}

function top(query: string, count = 8) {
  return searchDocuments(index, query, count)
}

function topTypes(query: string, count = 5) {
  return top(query, count).map((doc) => doc.type)
}

searchDocuments(index, 'HashMap')
const started = performance.now()
for (let i = 0; i < 40; i++) searchDocuments(index, 'HashMap')
const latency = (performance.now() - started) / 40

const lesson = top('Getting Started', 3)
expect('exact lesson title', lesson[0]?.type === 'lesson' && lesson[0].title === 'Getting Started')

const file = top('core1HelloWorld.java', 3)
expect('exact filename', file[0]?.type === 'example' && file[0].file === 'core1HelloWorld.java')

const pkg = top('pkg10networking', 5)
expect('package name', pkg.some((doc) => doc.url.includes('/examples/pkg10networking')))

const hashmap = top('HashMap')
expect('hashmap concept first', hashmap[0]?.type === 'concept' && hashmap[0].title === 'HashMap')
expect('hashmap concept once', hashmap.filter((doc) => doc.type === 'concept' && doc.title === 'HashMap').length === 1)
expect('hashmap interview', hashmap.slice(0, 8).filter((doc) => doc.type === 'interview' && /hashmap/i.test(doc.title)).length >= 3)
expect('hashmap how-it-works near top', hashmap.slice(0, 5).some((doc) => /how does hashmap work/i.test(doc.title)))

const binary = top('binary search')
expect('leetcode binary search', binary.some((doc) => doc.type === 'leetcode' && /binary search/i.test(doc.title) && doc.url.startsWith('/examples/pkg5leetcode/')))

const twoSum = top('Two Sum', 5)
expect('two sum internal', twoSum.some((doc) => doc.type === 'leetcode' && doc.title === 'Two Sum' && doc.url.startsWith('/examples/pkg5leetcode/') && !doc.url.includes('://')))

const lc20 = top('LC 20', 8)
expect('lc 20 is valid parentheses', lc20.some((doc) => doc.type === 'leetcode' && doc.file === 'leetcode2ValidParentheses.java'))

const project = top('Notes API')
expect('project title', project.some((doc) => doc.type === 'project' && /notes api/i.test(doc.title)))

const reference = top('Build Tools')
expect('reference page', reference.some((doc) => doc.type === 'reference' && /build tools/i.test(doc.title)))

const version = top('Java 21', 5)
expect('java 21 version', version.some((doc) => doc.type === 'version' && /java 21/i.test(doc.title)))
expect('java 8 page', top('Java 8', 5).some((doc) => doc.type === 'version' && doc.url === '/versions/java-8'))
expect('java 17 page', top('Java 17', 5).some((doc) => doc.type === 'version' && doc.url === '/versions/java-17'))
expect('jep 286 page', top('JEP 286', 5).some((doc) => doc.type === 'version' && doc.url === '/versions/java-10#jep-286'))
expect('gatherers file', top('versions8Java24Gatherers.java', 3).some((doc) => doc.file === 'versions8Java24Gatherers.java' || doc.url.includes('versions8Java24Gatherers')))

const jep = top('JEP 444', 5)
expect('jep 444', jep.some((doc) => doc.type === 'version' && /444/.test(doc.title + (doc.description || ''))))

const jep506 = top('JEP 506', 5)
expect('jep 506 internal', jep506.some((doc) => doc.type === 'version' && doc.url === '/versions/java-25#jep-506' && doc.title === 'Scoped Values'))
expect('jep 505 preview search', top('Structured Concurrency', 5).some((doc) => doc.url === '/versions/java-25#jep-505'))
expect('no result', top('zzzz-not-in-curriculum').length === 0)
expect('empty query', searchDocuments(index, '').length === 0)
expect('short query', searchDocuments(index, 'a').length === 0)
expect('special characters', Array.isArray(searchDocuments(index, '??? /// <script>')))
expect('unicode query', Array.isArray(searchDocuments(index, '文字列')))
expect('long query', Array.isArray(searchDocuments(index, 'Java '.repeat(400))))
expect('repeated query', JSON.stringify(top('HashMap')) === JSON.stringify(searchDocuments(index, 'HashMap', 8)))

const interview = top('volatile')
expect('volatile interview', interview.some((doc) => doc.type === 'interview' && /volatile/i.test(doc.title)))

// Phase 12 ranking principles (not brittle exact slots).
const stringHits = top('string', 5)
expect('string casefold', JSON.stringify(top('string', 5).map((doc) => doc.id)) === JSON.stringify(top('String', 5).map((doc) => doc.id)))
expect('string concept near top', stringHits.slice(0, 2).some((doc) => doc.type === 'concept' && doc.title === 'Strings'))
expect('string prefers learning material', stringHits.slice(0, 4).some((doc) => doc.type === 'example' || doc.type === 'lesson'))
expect('string core example near top', stringHits.slice(0, 4).some((doc) => doc.file === 'core9StringsDemo.java' || /strings demo/i.test(doc.title)))
expect('string lesson visible', stringHits.some((doc) => doc.type === 'lesson' && doc.title === 'Strings'))
expect('string not leetcode-first', stringHits[0]?.type !== 'leetcode')

const concurrent = top('ConcurrentHashMap', 5)
expect('concurrent hashmap interview', concurrent[0]?.type === 'interview' && /concurrenthashmap/i.test(concurrent[0].title))

const concurrency = top('concurrency', 5)
expect('concurrency concept first', concurrency[0]?.type === 'concept' && concurrency[0].title === 'Concurrency')
expect('concurrency lesson near top', concurrency.slice(0, 3).some((doc) => doc.type === 'lesson' && doc.title === 'Concurrency'))
expect('concurrency basics before advanced', concurrency.slice(0, 6).some((doc) => doc.file === 'concurrency1ThreadBasics.java'))
expect('concurrency not only advanced', !concurrency.slice(0, 3).every((doc) => /advconcurrency/i.test(doc.file || doc.title)))

const spring = top('Spring Boot', 5)
expect('spring lesson near top', spring.slice(0, 2).some((doc) => doc.type === 'lesson' && /spring boot/i.test(doc.title)))

const rest = top('REST API', 5)
expect('rest prefers code', topTypes('REST API', 3).filter((type) => type === 'example').length >= 2)

const virtual = top('virtual threads', 5)
expect('virtual threads has example or version', virtual.slice(0, 3).some((doc) => doc.type === 'example' || doc.type === 'version'))

const future = top('CompletableFuture', 5)
expect('completable future code or version', future.slice(0, 2).some((doc) => doc.type === 'example' || doc.type === 'version'))

const arrayList = top('ArrayList', 5)
expect('arraylist interview relevant', arrayList.slice(0, 5).some((doc) => doc.type === 'interview' && /arraylist/i.test(doc.title) && !/copyonwrite/i.test(doc.title)))

const types = new Set(index.map((doc) => doc.type))
for (const type of ['lesson', 'example', 'interview', 'leetcode', 'project', 'reference', 'version', 'concept']) {
  expect(`index has ${type}`, types.has(type as SearchDocument['type']))
}
expect('concept docs are A/B landings', index.filter((doc) => doc.type === 'concept').every((doc) => doc.url.startsWith('/concepts/') && doc.url !== '/concepts'))
expect('concept count', index.filter((doc) => doc.type === 'concept').length === 23)
expect('concept urls unique', new Set(index.filter((doc) => doc.type === 'concept').map((doc) => doc.url)).size === 23)
expect('documents have urls', index.every((doc) => doc.url.startsWith('/')))
expect('no source bodies', index.every((doc) => !('source' in doc) && (doc.description || '').length <= 220))
expect('index gzip budget', gzip < 250_000)
expect('search latency', latency < 30)

const counts = Object.fromEntries([...types].map((type) => [type, index.filter((doc) => doc.type === type).length]))
console.log(`Search index: ${index.length} documents, ${raw} bytes, ${gzip} gzip bytes, ${latency.toFixed(2)} ms`)
console.log(counts)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Search relevance checks passed')
