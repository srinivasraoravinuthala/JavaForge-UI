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
expect('hashmap interview', hashmap.slice(0, 5).filter((doc) => doc.type === 'interview' && /hashmap/i.test(doc.title)).length >= 3)

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

const types = new Set(index.map((doc) => doc.type))
for (const type of ['lesson', 'example', 'interview', 'leetcode', 'project', 'reference', 'version']) {
  expect(`index has ${type}`, types.has(type as SearchDocument['type']))
}
expect('documents have urls', index.every((doc) => doc.url.startsWith('/')))
expect('no source bodies', index.every((doc) => !('source' in doc) && (doc.description || '').length <= 220))
expect('index gzip budget', gzip < 250_000)
expect('search latency', latency < 20)

const counts = Object.fromEntries([...types].map((type) => [type, index.filter((doc) => doc.type === type).length]))
console.log(`Search index: ${index.length} documents, ${raw} bytes, ${gzip} gzip bytes, ${latency.toFixed(2)} ms`)
console.log(counts)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('Search relevance checks passed')
