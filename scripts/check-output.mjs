import { existsSync, readFileSync, readdirSync } from 'fs'

function canonical(html) {
  const match = html.match(/rel="canonical" href="([^"]+)"/)
  return match ? match[1] : ''
}

function jsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json" id="ld-json">([\s\S]*?)<\/script>/)
  if (!match) return null
  return JSON.parse(match[1])
}

const home = readFileSync('dist/index.html', 'utf8')
const lesson = readFileSync('dist/docs/02-learn--01-GettingStarted.html', 'utf8')
const example = readFileSync('dist/examples/pkg1core/core1HelloWorld.html', 'utf8')
const bookmarks = readFileSync('dist/bookmarks.html', 'utf8')
const robots = readFileSync('dist/robots.txt', 'utf8')
const patterns = JSON.parse(readFileSync('public/content/pages/examples/pkg8patterns.json', 'utf8'))
const core = JSON.parse(readFileSync('public/content/pages/examples/pkg1core.json', 'utf8'))
const sitemap = readFileSync('public/sitemap.xml', 'utf8')
const searchIndex = readFileSync('dist/content/search-index.json', 'utf8')

const failures = []
if ((home.match(/<title>/g) || []).length !== 1) failures.push('homepage title count')
if (!canonical(home).endsWith('javamastery.srinivasrao.co.in')) failures.push('home canonical')
if (home.includes('noindex')) failures.push('home noindex')
if ((home.match(/<h1/g) || []).length !== 1) failures.push('home h1 count')
if (!home.includes('Learn Java')) failures.push('home heading')
if (!home.includes('property="og:title"')) failures.push('home og title')
if (!home.includes('name="description"')) failures.push('home description')
if (!jsonLd(home)) failures.push('home json-ld')
if ((lesson.match(/<h1/g) || []).length !== 1) failures.push('lesson h1 count')
if (!canonical(lesson).endsWith('/docs/02-learn--01-GettingStarted')) failures.push('lesson canonical')
if (!lesson.includes('name="description"')) failures.push('lesson description')
if (!jsonLd(lesson)) failures.push('lesson json-ld')
if ((example.match(/<h1/g) || []).length !== 1) failures.push('example h1 count')
if (!example.includes('class="code-block"')) failures.push('example code')
if (!example.includes('property="og:title"')) failures.push('example og')
if (!bookmarks.includes('noindex')) failures.push('bookmarks indexable')
if (!bookmarks.includes('<h1')) failures.push('bookmarks h1')
if (!robots.includes('Disallow: /bookmarks')) failures.push('robots bookmarks')
if (!robots.includes('Sitemap:')) failures.push('robots sitemap')
if (sitemap.includes('/bookmarks')) failures.push('bookmarks in sitemap')
if (sitemap.includes('/search')) failures.push('search url in sitemap')
if (!searchIndex.startsWith('[')) failures.push('search index missing')

const collections = readFileSync('dist/docs/03-interview--03-Collections.html', 'utf8')
const puzzles = readFileSync('dist/docs/03-interview--17-PrintPuzzles.html', 'utf8')
const collectionsJson = JSON.parse(readFileSync('public/content/pages/docs/03-interview--03-Collections.json', 'utf8'))
const searchDocs = JSON.parse(searchIndex)
const conceptSearchDocs = searchDocs.filter((doc) => doc.type === 'concept')
if (conceptSearchDocs.length !== 23) failures.push(`concept search count ${conceptSearchDocs.length}`)
if (new Set(conceptSearchDocs.map((doc) => doc.url)).size !== conceptSearchDocs.length) failures.push('concept search url dupes')
if (conceptSearchDocs.some((doc) => !doc.url.startsWith('/concepts/') || doc.url === '/concepts')) failures.push('concept search url shape')
const hashmap = searchDocs.find((doc) => doc.type === 'interview' && doc.title === 'How does HashMap work internally?' && doc.url.includes('03-interview--03-Collections'))
const rapid = searchDocs.find((doc) => doc.title === 'Is Map a Collection?')
const css = readFileSync('dist/assets/' + readdirSync('dist/assets').find((name) => name.endsWith('.css')), 'utf8')
const questions = collectionsJson.doc.outline.filter((item) => item.kind === 'question')
if ((collections.match(/<h1/g) || []).length !== 1) failures.push('interview h1 count')
if (!collections.includes('<summary>')) failures.push('interview question summary')
if (!collections.includes('aria-label="Questions"')) failures.push('interview question nav')
if (!hashmap?.url.includes('#')) failures.push('hashmap search fragment')
if (hashmap && !collections.includes(`id="${hashmap.url.split('#')[1]}"`)) failures.push('hashmap id missing from html')
if (!rapid || rapid.url.includes('#')) failures.push('rapid-fire anchor invented')
if (questions[0]?.text !== '1. Overview of the Collections hierarchy?') failures.push('question order start')
const hashmapQuestion = questions.find((item) => item.text === '3. How does HashMap work internally?')
const later = questions.find((item) => item.text.startsWith('15.'))
if (!hashmapQuestion || !later || questions.indexOf(hashmapQuestion) > questions.indexOf(later)) failures.push('question source order')
if (!puzzles.includes('data-copy-code')) failures.push('interview copy button')
if (!puzzles.includes('id="puzzle-1"')) failures.push('puzzle heading id')
if (!css.includes('scroll-margin-top')) failures.push('scroll margin')
if (collections.includes('rel="canonical" href="') && collections.includes('#')) {
  const canonicalMatch = collections.match(/rel="canonical" href="([^"]+)"/)
  if (canonicalMatch && canonicalMatch[1].includes('#')) failures.push('fragment canonical')
}
const leetcode = JSON.parse(readFileSync('public/content/pages/examples/pkg5leetcode.json', 'utf8'))
const lcRows = leetcode.package.examples
const lcSolutions = lcRows.filter((row) => row.leetcode && !row.leetcode.helper)
const lcHelpers = lcRows.filter((row) => row.leetcode?.helper)
if (lcSolutions.length !== 262) failures.push('leetcode solution count')
if (lcHelpers.length !== 2) failures.push('leetcode helper count')
if (new Set(lcRows.map((row) => row.url)).size !== lcRows.length) failures.push('duplicate leetcode urls')
const starter = lcSolutions.filter((row) => row.leetcode.planId === 'starter')
if (starter[0]?.className !== 'leetcode1TwoSum' || starter[1]?.className !== 'leetcode2ValidParentheses') failures.push('starter order')
if (starter[1]?.leetcode.problemNumber !== '20') failures.push('starter problem number')
if (starter[0]?.leetcode.difficulty !== 'Easy') failures.push('starter difficulty')
if (starter[0]?.leetcode.grouping?.name !== 'Hashing') failures.push('starter pattern')
const blind = lcSolutions.filter((row) => row.leetcode.planId === 'blind75')
if (blind[0]?.leetcode.problemNumber !== '1' || blind[1]?.leetcode.problemNumber !== '121') failures.push('blind order')
if (blind[0]?.leetcode.difficulty) failures.push('invented blind difficulty')
if (blind[0]?.leetcode.grouping?.name !== 'Array') failures.push('blind category')
const rootSolution = JSON.parse(readFileSync('public/content/pages/examples/pkg5leetcode/leetcode1TwoSum.json', 'utf8'))
const blindSolution = JSON.parse(readFileSync('public/content/pages/examples/pkg5leetcode/blind75_LC1TwoSum.json', 'utf8'))
const diskRoot = readFileSync('../JavaForge/pkg5leetcode/leetcode1TwoSum.java', 'utf8')
const diskBlind = readFileSync('../JavaForge/pkg5leetcode/blind75/blind75_LC1TwoSum.java', 'utf8')
if (rootSolution.example.source !== diskRoot) failures.push('root source mutated')
if (blindSolution.example.source !== diskBlind) failures.push('blind source mutated')
if (!diskRoot.startsWith('package pkg5leetcode;')) failures.push('root package declaration')
if (!diskBlind.startsWith('package pkg5leetcode.blind75;')) failures.push('blind package declaration')
if (rootSolution.example.leetcode.next?.href !== '/examples/pkg5leetcode/leetcode2ValidParentheses') failures.push('starter next')
if (blindSolution.example.leetcode.difficulty) failures.push('blind detail difficulty')
if (blindSolution.example.leetcode.description) failures.push('invented blind statement')
if (!blindSolution.example.html.includes('class="code-block"')) failures.push('leetcode code panel')
const lcHtml = readFileSync('dist/examples/pkg5leetcode.html', 'utf8')
const lcSolutionHtml = readFileSync('dist/examples/pkg5leetcode/blind75_LC1TwoSum.html', 'utf8')
if ((lcHtml.match(/<h1/g) || []).length !== 1) failures.push('leetcode index h1')
if (!lcHtml.includes('Study plan')) failures.push('leetcode plan filter')
if (!lcHtml.includes('<select')) failures.push('leetcode plan select')
if ((lcSolutionHtml.match(/<h1/g) || []).length !== 1) failures.push('leetcode solution h1')
if (!lcSolutionHtml.includes('>Two Sum<')) failures.push('leetcode solution title')
if (!canonical(lcSolutionHtml).endsWith('/examples/pkg5leetcode/blind75_LC1TwoSum')) failures.push('leetcode canonical')
if (canonical(lcSolutionHtml).includes('#')) failures.push('leetcode fragment canonical')
const twoSumHit = searchDocs.find((doc) => doc.type === 'leetcode' && doc.title === 'Two Sum' && doc.url.includes('blind75_LC1TwoSum'))
if (!twoSumHit || !twoSumHit.url.startsWith('/examples/')) failures.push('leetcode search destination')
const conceptsModel = JSON.parse(readFileSync('public/content/concepts.json', 'utf8'))
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const conceptSitemap = sitemapLocs.filter((loc) => loc.endsWith('/concepts') || loc.includes('/concepts/'))
const nonConceptSitemap = sitemapLocs.length - conceptSitemap.length
if (nonConceptSitemap !== 570) failures.push(`non-concept sitemap count ${nonConceptSitemap}`)
if (conceptSitemap.length !== 1 + conceptsModel.concepts.length) failures.push(`concept sitemap count ${conceptSitemap.length}`)
if (new Set(sitemapLocs).size !== sitemapLocs.length) failures.push('sitemap duplicates')
if (!sitemap.includes('/concepts</loc>')) failures.push('concepts index sitemap')
if (!sitemap.includes('/concepts/strings</loc>')) failures.push('strings concept sitemap')
if (!sitemap.includes('/concepts/hashmap</loc>')) failures.push('hashmap concept sitemap')
if (!sitemap.includes('/concepts/concurrency</loc>')) failures.push('concurrency concept sitemap')
if (sitemap.includes('/concepts/not-a-real-concept')) failures.push('invalid concept in sitemap')
if (sitemap.includes('/search')) failures.push('search in sitemap')
if (sitemap.includes('/bookmarks')) failures.push('bookmarks in sitemap')
if (!sitemap.includes('/versions</loc>')) failures.push('version index sitemap')

const conceptsIndexHtml = readFileSync('dist/concepts.html', 'utf8')
if ((conceptsIndexHtml.match(/<h1/g) || []).length !== 1) failures.push('concepts index h1')
if (!conceptsIndexHtml.includes('>Concepts<')) failures.push('concepts index title')
if (!canonical(conceptsIndexHtml).endsWith('/concepts')) failures.push('concepts index canonical')
if (canonical(conceptsIndexHtml).includes('#')) failures.push('concepts index fragment canonical')
if (!conceptsIndexHtml.includes('property="og:title"')) failures.push('concepts index og')
if (!conceptsIndexHtml.includes('/concepts/strings')) failures.push('concepts index link strings')
if (!conceptsIndexHtml.includes('Coverage A') || !conceptsIndexHtml.includes('Coverage B')) failures.push('concepts index groups')
if ((conceptsIndexHtml.match(/<h2/g) || []).length < 2) failures.push('concepts index heading hierarchy')

const stringsHtml = readFileSync('dist/concepts/strings.html', 'utf8')
if ((stringsHtml.match(/<h1/g) || []).length !== 1) failures.push('strings concept h1')
if (!stringsHtml.includes('>Strings<')) failures.push('strings concept title')
if (!canonical(stringsHtml).endsWith('/concepts/strings')) failures.push('strings concept canonical')
if (canonical(stringsHtml).includes('#')) failures.push('strings concept fragment canonical')
if (!stringsHtml.includes('property="og:title"')) failures.push('strings concept og')
if (!stringsHtml.includes('name="description"')) failures.push('strings concept description')
if (!stringsHtml.includes('aria-label="Breadcrumb"')) failures.push('strings concept breadcrumb')
if (!stringsHtml.includes('id="concept-learn"') || !stringsHtml.includes('id="concept-code"')) failures.push('strings concept flow sections')
if (!stringsHtml.includes('id="concept-practice"') || !stringsHtml.includes('id="concept-interview"')) failures.push('strings concept practice/interview')
if (!stringsHtml.includes('/docs/02-learn--08-Strings')) failures.push('strings lesson link')
if (!stringsHtml.includes('/examples/pkg1core/core9StringsDemo')) failures.push('strings example link')
if (!stringsHtml.includes('Where it fits')) failures.push('strings fit section')
if ((stringsHtml.match(/<h1/g) || []).length !== 1 || !(stringsHtml.match(/<h2/g) || []).length) failures.push('strings heading hierarchy')

const hashmapHtml = readFileSync('dist/concepts/hashmap.html', 'utf8')
if (!hashmapHtml.includes('>HashMap<')) failures.push('hashmap concept title')
if (!canonical(hashmapHtml).endsWith('/concepts/hashmap')) failures.push('hashmap concept canonical')
if (!hashmapHtml.includes('href="/docs/') && !hashmapHtml.includes('href="/examples/')) {
  failures.push('hashmap concept resource links')
}
if (!hashmapHtml.includes('id="concept-learn"')) failures.push('hashmap learn section')
if (!hashmapHtml.includes('id="concept-code"')) failures.push('hashmap code section')
if (!hashmapHtml.includes('/docs/02-learn--17-Collections')) failures.push('hashmap collections lesson link')
if (!hashmapHtml.includes('core29HashMapDemo') && !hashmapHtml.includes('/examples/pkg1core/core29HashMapDemo')) {
  failures.push('hashmap key-contract demo link')
}
if (!hashmapHtml.includes('id="concept-interview"')) failures.push('hashmap interview section')
if (!hashmapHtml.includes('id="concept-practice"')) failures.push('hashmap practice section')
if (hashmapHtml.includes('id="concept-projects"')) failures.push('hashmap empty projects section')
if (hashmapHtml.includes('LeetCode: 0') || hashmapHtml.includes('Projects: 0')) failures.push('hashmap zero counts')

const collectionsHtml = readFileSync('dist/docs/02-learn--17-Collections.html', 'utf8')
if (!collectionsHtml.includes('id="hashmap"') && !collectionsHtml.includes('>HashMap<')) failures.push('collections hashmap section')
if (!collectionsHtml.includes('3-how-does-hashmap-work-internally')) failures.push('collections hashmap interview bridge')
if (!collectionsHtml.includes('core29HashMapDemo')) failures.push('collections hashmap demo mention')
if (!collectionsHtml.includes('blind75_LC1TwoSum')) failures.push('collections hashmap practice bridge')

const concurrencyHtml = readFileSync('dist/concepts/concurrency.html', 'utf8')
if (!concurrencyHtml.includes('>Concurrency<')) failures.push('concurrency concept title')
if (!canonical(concurrencyHtml).endsWith('/concepts/concurrency')) failures.push('concurrency concept canonical')
if (!concurrencyHtml.includes('id="concept-learn"') || !concurrencyHtml.includes('id="concept-code"')) failures.push('concurrency learn/code')
if (concurrencyHtml.includes('id="concept-practice"')) failures.push('concurrency empty practice')
if (!concurrencyHtml.includes('id="concept-reference"') && !concurrencyHtml.includes('id="concept-versions"')) {
  failures.push('concurrency reference or versions')
}

const optionalHtml = readFileSync('dist/concepts/optional.html', 'utf8')
if (!optionalHtml.includes('id="concept-related"')) failures.push('optional related section')
if (!optionalHtml.includes('/concepts/')) failures.push('optional related link')

if (existsSync('dist/concepts/spring-boot.html') || existsSync('dist/concepts/springbootintro.html')) {
  failures.push('out-of-slice spring concept prerendered')
}

const stringsLessonHtml = readFileSync('dist/docs/02-learn--08-Strings.html', 'utf8')
if (!stringsLessonHtml.includes('related-concepts') || !stringsLessonHtml.includes('/concepts/strings')) {
  failures.push('strings lesson related concept chip')
}
const stringsExampleHtml = readFileSync('dist/examples/pkg1core/core9StringsDemo.html', 'utf8')
if (!stringsExampleHtml.includes('/concepts/strings')) failures.push('strings example related concept chip')
if (!readFileSync('dist/index.html', 'utf8').includes('/concepts')) failures.push('concepts nav link missing')
for (const concept of conceptsModel.concepts) {
  const htmlPath = `dist/concepts/${concept.slug}.html`
  const pagePath = `public/content/pages/concepts/${concept.slug}.json`
  if (!existsSync(htmlPath) || !existsSync(pagePath)) failures.push(`missing concept route ${concept.slug}`)
  else if (!sitemap.includes(`/concepts/${concept.slug}</loc>`)) failures.push(`sitemap missing concept ${concept.slug}`)
}
if (existsSync('dist/concepts/not-a-real-concept.html')) failures.push('unknown concept prerendered')
if (existsSync('public/content/pages/concepts/not-a-real-concept.json')) failures.push('unknown concept page json')
const java25 = JSON.parse(readFileSync('public/content/pages/versions/java-25.json', 'utf8'))
const java25Html = readFileSync('dist/versions/java-25.html', 'utf8')
const java21Html = readFileSync('dist/examples/pkg2versions/versions6Java21Features.html', 'utf8')
const versionChapter = readFileSync('dist/docs/02-learn--21-JavaVersions.html', 'utf8')
if ((java25Html.match(/<h1/g) || []).length !== 1) failures.push('java 25 h1')
if (!java25Html.includes('>Java 25<')) failures.push('java 25 heading')
if (!canonical(java25Html).endsWith('/versions/java-25')) failures.push('java 25 canonical')
if (canonical(java25Html).includes('#')) failures.push('java 25 fragment canonical')
if (!java21Html.includes('JEP 444')) failures.push('java 21 demo missing')
if (!versionChapter.includes('Java 21')) failures.push('java 21 chapter missing')
if (java25.canonicalPath.includes('#')) failures.push('java 25 canonical path fragment')
const expected = {
  470: ['PEM Encodings of Cryptographic Objects (Preview)', 'Preview'],
  502: ['Stable Values (Preview)', 'Preview'],
  503: ['Remove the 32-bit x86 Port', 'Final'],
  505: ['Structured Concurrency (Fifth Preview)', 'Preview'],
  506: ['Scoped Values', 'Final'],
  507: ['Primitive Types in Patterns, instanceof, and switch (Third Preview)', 'Preview'],
  508: ['Vector API (Tenth Incubator)', 'Incubator'],
  509: ['JFR CPU-Time Profiling (Experimental)', 'Experimental'],
  510: ['Key Derivation Function API', 'Final'],
  511: ['Module Import Declarations', 'Final'],
  512: ['Compact Source Files and Instance Main Methods', 'Final'],
  513: ['Flexible Constructor Bodies', 'Final'],
  514: ['Ahead-of-Time Command-Line Ergonomics', 'Final'],
  515: ['Ahead-of-Time Method Profiling', 'Final'],
  518: ['JFR Cooperative Sampling', 'Final'],
  519: ['Compact Object Headers', 'Final'],
  520: ['JFR Method Timing & Tracing', 'Final'],
  521: ['Generational Shenandoah', 'Final'],
}
if (java25.java25.features.length !== 18) failures.push('java 25 feature count')
for (const feature of java25.java25.features) {
  const row = expected[feature.jep]
  if (!row) failures.push(`unexpected jep ${feature.jep}`)
  else if (feature.title !== row[0] || feature.status !== row[1]) failures.push(`jep ${feature.jep} label`)
  if (!feature.jepUrl.startsWith('https://openjdk.org/jeps/')) failures.push(`jep ${feature.jep} link`)
  if (feature.title.includes('Preview') && feature.status === 'Final') failures.push(`preview marked final ${feature.jep}`)
  if (feature.title.includes('Incubator') && feature.status !== 'Incubator') failures.push(`incubator status ${feature.jep}`)
  if (feature.jep === 509 && feature.status === 'Final') failures.push('experimental marked final')
  if (!java25Html.includes(`id="jep-${feature.jep}"`)) failures.push(`missing jep section ${feature.jep}`)
  if (!java25Html.includes(`https://openjdk.org/jeps/${feature.jep}`)) failures.push(`missing jep url ${feature.jep}`)
}
if (!java25Html.includes('leaves JavaForge')) failures.push('external link label')
const structured = java25.java25.features.find((feature) => feature.jep === 505)
if (structured?.status !== 'Preview') failures.push('structured concurrency status')
const featureIds = new Set()
for (let version = 6; version <= 25; version += 1) {
  if (!sitemap.includes(`/versions/java-${version}</loc>`)) failures.push(`sitemap java ${version}`)
  const pagePath = `public/content/pages/versions/java-${version}.json`
  const htmlPath = `dist/versions/java-${version}.html`
  if (!existsSync(pagePath) || !existsSync(htmlPath)) {
    failures.push(`missing java ${version}`)
    continue
  }
  const page = JSON.parse(readFileSync(pagePath, 'utf8'))
  const html = readFileSync(htmlPath, 'utf8')
  if ((html.match(/<h1/g) || []).length !== 1) failures.push(`java ${version} h1`)
  if (!html.includes(`>Java ${version}<`)) failures.push(`java ${version} heading`)
  if (!canonical(html).endsWith(`/versions/java-${version}`)) failures.push(`java ${version} canonical`)
  if (canonical(html).includes('#')) failures.push(`java ${version} fragment`)
  if (!html.includes('property="og:title"')) failures.push(`java ${version} og`)
  if (!html.includes('name="description"')) failures.push(`java ${version} description`)
  if (!html.includes('aria-label="Versions"')) failures.push(`java ${version} nav`)
  const release = page.release
  if (!release || release.version !== version || !release.features.length) failures.push(`java ${version} release`)
  if (version === 6 && release?.previous) failures.push('java 6 has previous')
  if (version === 25 && release?.next) failures.push('java 25 has next')
  if (version > 6 && release?.previous?.href !== `/versions/java-${version - 1}`) failures.push(`java ${version} previous`)
  if (version < 25 && release?.next?.href !== `/versions/java-${version + 1}`) failures.push(`java ${version} next`)
  for (const feature of release?.features || []) {
    if (featureIds.has(feature.id)) failures.push(`duplicate feature ${feature.id}`)
    featureIds.add(feature.id)
    if (!['Final', 'Preview', 'Incubator', 'Experimental'].includes(feature.status)) failures.push(`bad status ${feature.id}`)
    if (feature.status === 'Final' && /(Preview|Incubator|Experimental)/.test(feature.name)) failures.push(`final label ${feature.id}`)
  }
  for (const example of release?.examples || []) {
    if (!existsSync(`../JavaForge/${example.href.replace(/^\/examples\//, '')}.java`)) failures.push(`missing example ${example.href}`)
  }
}
const java19 = JSON.parse(readFileSync('public/content/pages/versions/java-19.json', 'utf8'))
if (java19.release.features.find((feature) => feature.jep === 425)?.status !== 'Preview') failures.push('java 19 virtual threads')
const java21Release = JSON.parse(readFileSync('public/content/pages/versions/java-21.json', 'utf8'))
if (java21Release.release.features.find((feature) => feature.jep === 453)?.status !== 'Preview') failures.push('java 21 structured concurrency')
if (java21Release.release.features.find((feature) => feature.jep === 444)?.status !== 'Final') failures.push('java 21 virtual threads')
const versionIndex = readFileSync('dist/versions.html', 'utf8')
if ((versionIndex.match(/<h1/g) || []).length !== 1) failures.push('version index h1')
if (!canonical(versionIndex).endsWith('/versions')) failures.push('version index canonical')
if (canonical(versionIndex).includes('#')) failures.push('version index fragment')
for (const file of ['versions2Java7Features', 'versions3Java8Features', 'versions4Java9To11Features', 'versions5Java17Features', 'versions6Java21Features', 'versions7Java22Unnamed', 'versions8Java24Gatherers', 'versions9Java25ScopedValues']) {
  if (!existsSync(`dist/examples/pkg2versions/${file}.html`)) failures.push(`missing route ${file}`)
}
const java7Source = readFileSync('../JavaForge/pkg2versions/versions2Java7Features.java', 'utf8')
if (java7Source.includes('->') || java7Source.includes('computeIfAbsent')) failures.push('java 7 later syntax')
if (!java7Source.includes('case "start":')) failures.push('java 7 string switch')
const java9Source = readFileSync('../JavaForge/pkg2versions/versions4Java9To11Features.java', 'utf8')
if (java9Source.split('Collectors.toList()').join('').includes('.toList(')) failures.push('java 9 toList')
if (!java9Source.includes('Collectors.toList()')) failures.push('java 9 collector')
const java5Source = readFileSync('../JavaForge/pkg2versions/versions1Java5Features.java', 'utf8')
if (java5Source.includes('@SafeVarargs') || java5Source.includes('new ArrayList<>')) failures.push('java 5 later syntax')
const structuredSource = readFileSync('../JavaForge/pkg16advconcurrency/advconcurrency7StructuredConcurrency.java', 'utf8')
if (structuredSource.includes('new StructuredTaskScope')) failures.push('structured constructor')
if (!structuredSource.includes('StructuredTaskScope.open')) failures.push('structured factory')
if (!structuredSource.includes('--enable-preview')) failures.push('structured preview flag')
if (!/preview/i.test(structuredSource)) failures.push('structured preview status')
const java12Html = readFileSync('dist/versions/java-12.html', 'utf8')
const java17Page = readFileSync('dist/versions/java-17.html', 'utf8')
const java19Page = readFileSync('dist/versions/java-19.html', 'utf8')
if (!java12Html.includes('Cumulative Java 12') || !java12Html.includes('Requires Java 17')) failures.push('java 12 cumulative label')
if (!java17Page.includes('Cumulative Java 12') || !java17Page.includes('Requires Java 17')) failures.push('java 17 cumulative label')
if (!java19Page.includes('Modern Java 21 example') || !java19Page.includes('Requires Java 21')) failures.push('java 19 modern label')
if (java19Page.includes('Java 19 example')) failures.push('java 19 mislabeled example')
const java7Page = JSON.parse(readFileSync('public/content/pages/versions/java-7.json', 'utf8'))
if (java7Page.release.examples[0].requiredJava !== 7) failures.push('java 7 required')
const java11Page = JSON.parse(readFileSync('public/content/pages/versions/java-11.json', 'utf8'))
if (java11Page.release.examples[0].requiredJava !== 11 || !java11Page.release.examples[0].exampleType.includes('Cumulative')) failures.push('java 11 cumulative')
const java7Example = readFileSync('dist/examples/pkg2versions/versions2Java7Features.html', 'utf8')
if (!java7Example.includes('Requires') || !java7Example.includes('Java 7 example')) failures.push('java 7 example metadata')
if (!canonical(java7Example).endsWith('/examples/pkg2versions/versions2Java7Features')) failures.push('java 7 example canonical')
const scoped = searchDocs.find((doc) => doc.url === '/versions/java-25#jep-506')
if (!scoped || scoped.type !== 'version' || !scoped.url.startsWith('/versions/java-25')) failures.push('java 25 search destination')
for (const row of lcRows) {
  if (!existsSync(`../JavaForge/${row.path}`)) failures.push(`missing source ${row.path}`)
}

const names = patterns.package.examples.map((e) => e.className)
if (names[0] !== 'patterns1SingletonPattern' || names[9] !== 'patterns10FacadePattern') failures.push('pattern order')
const coreNames = core.package.examples.map((e) => e.className)
if (coreNames.indexOf('core24UserInput') > coreNames.indexOf('core10Encapsulation')) failures.push('core order')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('SEO and study-order checks passed')
