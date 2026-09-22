#!/usr/bin/env node
/**
 * Read JavaForge at build time and write static page JSON.
 * The browser never calls GitHub or a backend.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import properties from 'highlight.js/lib/languages/properties'
import { JAVA25_FEATURES } from './java25-features.mjs'
import { EXAMPLE_COMPAT, JAVA_VERSIONS, VERSION_INDEX } from './java-versions.mjs'

hljs.registerLanguage('java', java)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('properties', properties)

const UI_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FORGE = resolve(UI_ROOT, '..', 'JavaForge')
const OUT = join(UI_ROOT, 'public', 'content', 'pages')
const SITE = (process.env.VITE_SITE_URL || 'https://javamastery.srinivasrao.co.in').replace(/\/$/, '')
const SOURCE_REPO = 'https://github.com/srinivasraoravinuthala/JavaMastery'
const unresolvedLinks = []
if (!/^https?:\/\/[^/]+$/.test(SITE)) {
  throw new Error(`VITE_SITE_URL must be an origin without a path: ${SITE}`)
}

const CORE_STUDY = [
  'core1HelloWorld',
  'core2Variables',
  'core3DataTypes',
  'core4Operators',
  'core5ControlStatements',
  'core6Loops',
  'core7Methods',
  'core8ArraysDemo',
  'core9StringsDemo',
  'core24UserInput',
  'core25ClassesAndObjectsDemo',
  'core10Encapsulation',
  'core11Inheritance',
  'core12Polymorphism',
  'core13AbstractionDemo',
  'core14InterfacesDemo',
  'core15EnumsDemo',
  'core16RecordsDemo',
  'core17SealedClassesDemo',
  'core18ExceptionsDemo',
  'core19CollectionsDemo',
  'core20GenericsDemo',
  'core21FunctionalProgramming',
  'core22StreamsDemo',
  'core23OptionalDemo',
  'core26ConstructorsDemo',
  'core27StaticMembersDemo',
  'core28ComparatorDemo',
]

const LEETCODE_FOLDERS = ['', 'blind75', 'official75', 'interview150', 'top100', 'common']
const LEETCODE_TRACKS = [
  { folder: '', id: 'starter', label: 'Starter' },
  { folder: 'blind75', id: 'blind75', label: 'Blind 75' },
  { folder: 'official75', id: 'official75', label: 'LeetCode 75' },
  { folder: 'interview150', id: 'interview150', label: 'Interview 150' },
  { folder: 'top100', id: 'top100', label: 'Top 100' },
  { folder: 'common', id: 'helpers', label: 'Helpers' },
]

const PACKAGE_ROLE = {
  pkg0intro: 'Orientation',
  pkg1core: 'Core Java',
  pkg2versions: 'Java versions',
  pkg3datastructures: 'Data structures',
  pkg4algorithms: 'Algorithms',
  pkg5leetcode: 'LeetCode',
  pkg6jvm: 'JVM',
  pkg7concurrency: 'Concurrency',
  pkg8patterns: 'Design patterns',
  pkg9io: 'I/O',
  pkg10networking: 'Networking',
  pkg11jdbc: 'JDBC',
  pkg12restapi: 'REST',
  pkg13libs: 'Standard libraries',
  pkg14testing: 'Testing',
  pkg15modules: 'Modules',
  pkg16advconcurrency: 'Advanced concurrency',
  pkg17metaprogramming: 'Metaprogramming',
  pkg18resiliencepatterns: 'Resilience',
  pkg19performance: 'Performance',
  pkg20serialization: 'Serialization',
  pkg21spring: 'Spring',
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
    if (entry === '.git' || entry === 'target' || entry === 'node_modules') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

function rel(file) {
  return relative(FORGE, file).replace(/\\/g, '/')
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data))
}

function esc(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function pathToSlug(docPath) {
  return docPath.replace(/^docs\//, '').replace(/\.md$/, '').replace(/\//g, '--')
}

function docUrl(docPath) {
  return `/docs/${pathToSlug(docPath)}`
}

function plain(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_>#|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function summarize(markdown, fallback) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '\n')
  const lines = withoutCode.split('\n').map((line) => line.trim()).filter((line) => {
    if (!line || line.startsWith('#') || line === '---' || line.startsWith('|')) return false
    if (line.startsWith('**Previous:**') || line.startsWith('**Next:**') || line.startsWith('**Related')) return false
    if (/^[^\w]/.test(line) && line.includes('`')) return false
    return true
  })
  const text = plain(lines.join('\n'))
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  let summary = ''
  for (const sentence of sentences) {
    const next = `${summary}${sentence}`.trim()
    if (next.length > 180) break
    summary = `${next} `
    if (summary.trim().length > 80) break
  }
  summary = summary.trim()
  if (summary.length >= 40 && !summary.startsWith('Async:')) return summary
  const headings = [...markdown.matchAll(/^##\s+(.+)$/gm)]
    .map((match) => match[1].replace(/[*_`]/g, '').trim())
    .filter((heading) => heading && !heading.startsWith('Related'))
    .slice(0, 3)
  if (headings.length) return `${displayTitle(fallback)}. ${headings.join('. ')}.`.slice(0, 180)
  return summary || displayTitle(fallback)
}

function displayTitle(title) {
  return title.replace(/^\d+\s*[—–\-:|→>]+\s*/, '').replace(/\s+/g, ' ').trim()
}

function pageTitle(name) {
  return `${displayTitle(name)} | JavaMastery`
}

const CURRICULUM = [
  ['foundation', 'Foundation', 1, 9],
  ['core', 'Core Java', 10, 20],
  ['versions', 'Java versions', 21, 21],
  ['structures', 'Data structures', 22, 22],
  ['algorithms', 'Algorithms', 23, 23],
  ['leetcode', 'LeetCode', 24, 24],
  ['jvm', 'JVM', 25, 25],
  ['concurrency', 'Concurrency', 26, 26],
  ['patterns', 'Patterns', 27, 27],
  ['io', 'I/O', 28, 28],
  ['networking', 'Networking', 29, 29],
  ['jdbc', 'JDBC', 30, 30],
  ['rest', 'REST', 31, 31],
  ['libraries', 'Standard libraries', 32, 32],
  ['testing', 'Testing', 33, 33],
  ['modules', 'Modules', 34, 34],
  ['serialization', 'Serialization', 35, 35],
  ['performance', 'Performance', 36, 36],
  ['interview-prep', 'Interview preparation', 37, 37],
  ['meta', 'Metaprogramming', 38, 38],
  ['resilience', 'Resilience', 39, 39],
  ['spring', 'Spring', 40, 40],
  ['projects', 'Projects', 41, 41],
]

function chapterNo(doc) {
  const match = doc.path.match(/02-learn\/(\d+)-/)
  return match ? Number(match[1]) : 0
}

function stageOf(n) {
  return CURRICULUM.find(([, , from, to]) => n >= from && n <= to) || null
}

function firstTitle(markdown, fallback) {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (!match) return fallback
  return match[1].replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim()
}

function packageNumber(name) {
  const match = name.match(/^pkg(\d+)/)
  return match ? Number(match[1]) : 999
}

function studyKey(pkg, filePath, className) {
  if (pkg === 'pkg1core') {
    const index = CORE_STUDY.indexOf(className)
    if (index >= 0) return [0, index]
  }
  if (pkg === 'pkg5leetcode') {
    const folder = filePath.split('/')[1] === className + '.java' ? '' : filePath.split('/')[1]
    const folderIndex = Math.max(0, LEETCODE_FOLDERS.indexOf(folder))
    const lc = className.match(/_LC(\d+)/)
    const n = lc ? Number(lc[1]) : Number((className.match(/(\d+)/) || ['', '0'])[1])
    return [folderIndex, n]
  }
  const n = Number((className.match(/(\d+)/) || ['', '0'])[1])
  return [0, n]
}

function highlight(code, lang) {
  const language = hljs.getLanguage(lang) ? lang : 'plaintext'
  try {
    if (language === 'plaintext') return esc(code)
    return hljs.highlight(code, { language }).value
  } catch {
    return esc(code)
  }
}

function codeBlock(code, lang) {
  const lines = code.replace(/\n$/, '').split('\n')
  const body = lines
    .map((line, i) => {
      const html = highlight(line, lang || 'plaintext')
      return `<span class="code-line"><span class="code-ln">${i + 1}</span><span class="code-text">${html || ' '}</span></span>`
    })
    .join('')
  return `<pre class="code-block"><code>${body}</code></pre>`
}

function resolveCurriculumHref(href) {
  const hashIndex = href.indexOf('#')
  const pathPart = (hashIndex >= 0 ? href.slice(0, hashIndex) : href).replace(/\\/g, '/')
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''
  if (!pathPart.startsWith('.')) return null
  const cleaned = pathPart.replace(/^(?:\.\/|\.\.\/)+/, '').replace(/\/+$/, '')
  if (!cleaned) return null
  if (cleaned === 'README.md') return SOURCE_REPO
  if (cleaned === 'build') return '/docs/04-reference--13-BuildTools'
  if (cleaned === 'projects') return `/projects${hash}`
  const project = cleaned.match(/^projects\/([^/]+)(?:\/.*)?$/)
  if (project) return `/projects#${project[1]}`
  const pkg = cleaned.match(/^(pkg\d+[a-z0-9]+)(?:\/(.*))?$/)
  if (!pkg) return null
  const name = pkg[1]
  const rest = pkg[2] || ''
  if (!rest || rest.endsWith('README.md')) return `/examples/${name}${hash}`
  if (rest.endsWith('.java')) {
    const className = rest.split('/').pop().replace(/\.java$/, '')
    return `/examples/${name}/${className}${hash}`
  }
  return `/examples/${name}${hash}`
}

function collapseDuplicateAnchors(html) {
  const seen = new Set()
  return html.replace(/<p><a id="([^"]+)"><\/a><\/p>/g, (match, id) => {
    if (seen.has(id)) return ''
    seen.add(id)
    return match
  })
}

function resolveDoc(href, currentDoc) {
  const hashIndex = href.indexOf('#')
  const pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : ''
  if (!pathPart.endsWith('.md')) return null
  const parts = currentDoc.split('/')
  parts.pop()
  for (const segment of pathPart.split('/')) {
    if (segment === '..') parts.pop()
    else if (segment !== '.' && segment !== '') parts.push(segment)
  }
  const docPath = parts.join('/')
  if (!docPath.startsWith('docs/') || !existsSync(join(FORGE, docPath))) return null
  return { url: `${docUrl(docPath)}${hash}`, docPath }
}

function renderMarkdown(markdown, currentDoc) {
  const headings = []
  const used = new Map()
  const renderer = new marked.Renderer()
  renderer.heading = function ({ text, depth }) {
    const base = slugifyHeading(text) || 'section'
    const count = used.get(base) || 0
    used.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count}`
    headings.push({ id, text: text.replace(/<[^>]+>/g, ''), level: depth })
    return `<h${depth} id="${id}" tabindex="-1">${text}</h${depth}>`
  }
  renderer.code = function ({ text, lang }) {
    const language = (lang || 'code').split(/\s+/)[0] || 'code'
    return `<div class="code-panel"><div class="code-toolbar"><span class="code-filename">${esc(language)}</span><button type="button" class="text-button" data-copy-code>Copy</button></div><div class="code-scroll">${codeBlock(text, language === 'code' ? '' : language)}</div></div>`
  }
  renderer.link = function ({ href, text }) {
    if (!href) return text
    if (href.startsWith('http')) {
      return `<a href="${esc(href)}" rel="noopener noreferrer">${text}</a>`
    }
    const doc = href.includes('.md') ? resolveDoc(href, currentDoc) : null
    if (doc) return `<a href="${esc(doc.url)}">${text}</a>`
    const curriculum = resolveCurriculumHref(href)
    if (curriculum) {
      if (curriculum.startsWith('http')) return `<a href="${esc(curriculum)}" rel="noopener noreferrer">${text}</a>`
      return `<a href="${esc(curriculum)}">${text}</a>`
    }
    if (href.startsWith('.')) {
      unresolvedLinks.push(`${currentDoc} -> ${href}`)
      return text
    }
    return `<a href="${esc(href)}">${text}</a>`
  }
  marked.setOptions({ gfm: true, renderer })
  const html = collapseDuplicateAnchors(marked.parse(markdown, { async: false }))
  return { html, headings }
}

function runMode(path, source) {
  if (path.startsWith('build/gradle/')) return 'GRADLE'
  if (
    path.startsWith('build/maven/') ||
    path.startsWith('pkg14testing/') ||
    path.startsWith('pkg20serialization/') ||
    path.startsWith('pkg21spring/') ||
    path.includes('/jmh-demo/') ||
    path.includes('/spi-demo/')
  ) {
    return /static void main\s*\(/.test(source) ? 'MAVEN' : 'NON_RUNNABLE'
  }
  if (path.includes('/src/test/')) return 'NON_RUNNABLE'
  if (!/static void main\s*\(/.test(source)) return 'NON_RUNNABLE'
  if (/^pkg11jdbc\/jdbc[234]/.test(path)) return 'OPTIONAL_DEPENDENCY'
  return 'SINGLE_FILE'
}

function runCommand(path, mode) {
  if (mode === 'SINGLE_FILE' || mode === 'OPTIONAL_DEPENDENCY') return `java ${path}`
  if (mode === 'MAVEN' && path.startsWith('pkg14testing/')) return 'mvn test -f pkg14testing/pom.xml'
  if (mode === 'MAVEN' && path.startsWith('pkg21spring/')) return 'mvn spring-boot:run -f pkg21spring/pom.xml'
  if (mode === 'MAVEN' && path.startsWith('pkg20serialization/')) return 'mvn -f pkg20serialization/pom.xml compile'
  if (mode === 'GRADLE') return 'gradle run'
  if (mode === 'MAVEN') return 'mvn compile'
  return null
}

function dependencies(path, source) {
  const imports = [...source.matchAll(/^import\s+(?:static\s+)?([\w.]+);/gm)]
    .map((m) => m[1])
    .filter((name) => !name.startsWith('java.') && !name.startsWith('javax.'))
  const deps = [...new Set(imports)]
  if (path.startsWith('pkg11jdbc/jdbc')) deps.push('Optional in-memory JDBC driver (H2, SQLite, or HSQLDB)')
  return deps
}

function javaVersion(path) {
  const file = path.split('/').pop() || ''
  const named = file.match(/Java(\d+(?:To\d+)*)/)
  return named ? named[1].replace('To', '–') : null
}

function basePage(partial) {
  return {
    robots: 'index,follow',
    ...partial,
  }
}

if (!existsSync(join(FORGE, 'docs'))) {
  console.error(`JavaForge not found at ${FORGE}`)
  process.exit(1)
}

const mdFiles = walk(join(FORGE, 'docs')).filter((f) => f.endsWith('.md'))
const javaFiles = walk(FORGE).filter((f) => f.endsWith('.java'))

const docs = mdFiles.map((file) => {
  const path = rel(file)
  const markdown = readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const title = firstTitle(markdown, path)
  const section = path.split('/')[1] || 'docs'
  return {
    path,
    slug: pathToSlug(path),
    url: docUrl(path),
    title,
    description: summarize(markdown, title),
    section,
    order: path,
    markdown,
  }
})
docs.sort((a, b) => a.path.localeCompare(b.path))

const lessonToExamples = new Map()
for (const doc of docs) {
  if (!doc.path.startsWith('docs/02-learn/')) continue
  const mentions = doc.markdown.match(/pkg\d[\w./-]*\.java/g) || []
  for (const mention of mentions) {
    if (!lessonToExamples.has(mention)) lessonToExamples.set(mention, doc.url)
  }
}

const examples = javaFiles.map((file) => {
  const path = rel(file)
  const source = readFileSync(file, 'utf8')
  const parts = path.split('/')
  const pkg = parts[0].startsWith('pkg') ? parts[0] : parts[0]
  const className = parts[parts.length - 1].replace(/\.java$/, '')
  const mode = runMode(path, source)
  const [group, order] = path.startsWith('pkg') ? studyKey(pkg, path, className) : [0, 0]
  const linkedLesson = lessonToExamples.get(path) || null
  return {
    path,
    pkg,
    className,
    role: PACKAGE_ROLE[pkg] || (path.startsWith('projects/') ? 'Project' : 'Build'),
    studyGroup: group,
    studyOrder: order,
    runMode: mode,
    runCommand: runCommand(path, mode),
    javaVersion: javaVersion(path),
    ...(EXAMPLE_COMPAT[className] || {}),
    dependencies: dependencies(path, source),
    linkedLesson,
    source,
    url: path.startsWith('pkg') ? `/examples/${pkg}/${className}` : null,
  }
})
annotateLeetcode(examples)

const packages = [...new Set(examples.map((e) => e.pkg).filter((p) => p.startsWith('pkg')))]
packages.sort((a, b) => packageNumber(a) - packageNumber(b) || a.localeCompare(b))

for (const pkg of packages) {
  const rows = examples.filter((e) => e.pkg === pkg).sort((a, b) => a.studyGroup - b.studyGroup || a.studyOrder - b.studyOrder || a.className.localeCompare(b.className))
  const names = rows.map((r) => r.className)
  if (new Set(names).size !== names.length) {
    throw new Error(`Duplicate class names in ${pkg}`)
  }
}

const patternOrder = examples
  .filter((e) => e.pkg === 'pkg8patterns')
  .sort((a, b) => a.studyOrder - b.studyOrder)
  .map((e) => e.className)
if (patternOrder[0] !== 'patterns1SingletonPattern' || patternOrder[9] !== 'patterns10FacadePattern') {
  throw new Error(`Pattern study order is wrong: ${patternOrder.slice(0, 12).join(', ')}`)
}

const coreOrder = examples
  .filter((e) => e.pkg === 'pkg1core')
  .sort((a, b) => a.studyOrder - b.studyOrder)
  .map((e) => e.className)
if (coreOrder.indexOf('core24UserInput') > coreOrder.indexOf('core10Encapsulation')) {
  throw new Error('Learning path override failed: core24 should precede core10')
}

const learnDocs = docs.filter((d) => d.path.startsWith('docs/02-learn/') && !d.path.endsWith('00-INDEX.md'))
for (const doc of learnDocs) {
  if (!stageOf(chapterNo(doc))) throw new Error(`Chapter is outside the curriculum map: ${doc.path}`)
}

const stages = CURRICULUM.map(([id, label, from, to]) => {
  const chapters = learnDocs.filter((doc) => {
    const n = chapterNo(doc)
    return n >= from && n <= to
  })
  if (!chapters.length) return null
  return {
    id,
    label,
    href: chapters[0].url,
    title: displayTitle(chapters[0].title),
    chapterHrefs: chapters.map((doc) => doc.url),
    chapters: chapters.map((doc) => ({
      number: chapterNo(doc),
      title: displayTitle(doc.title),
      href: doc.url,
      description: doc.description,
    })),
  }
}).filter(Boolean)

function neighbors(list, index) {
  return {
    previous: index > 0 ? { href: list[index - 1].url, title: list[index - 1].title } : null,
    next: index < list.length - 1 ? { href: list[index + 1].url, title: list[index + 1].title } : null,
  }
}

const projectCatalog = loadProjects()

for (const doc of docs) {
  const rendered = renderMarkdown(doc.markdown, doc.path)
  doc.searchHeadings = rendered.headings
  const siblings = docs.filter((d) => d.section === doc.section && !d.path.endsWith('00-INDEX.md'))
  const index = siblings.findIndex((d) => d.path === doc.path)
  const nav = index >= 0 ? neighbors(siblings, index) : { previous: null, next: null }
  if (nav.previous) nav.previous = { ...nav.previous, title: displayTitle(nav.previous.title) }
  if (nav.next) nav.next = { ...nav.next, title: displayTitle(nav.next.title) }
  const stage = stageOf(chapterNo(doc))
  const shown = displayTitle(doc.title)
  const crumb = [
    { name: 'JavaMastery', href: '/' },
    { name: sectionLabel(doc.section), href: sectionHref(doc.section) },
    ...(stage ? [{ name: stage[1], href: stages.find((item) => item.id === stage[0])?.href || doc.url }] : []),
    { name: shown, href: doc.url },
  ]
  const mentions = [...new Set(doc.markdown.match(/pkg\d[\w./-]*\.java/g) || [])]
  const related = mentions
    .map((path) => examples.find((example) => example.path === path))
    .filter(Boolean)
    .slice(0, 6)
    .map(exampleSummary)
  const connected = connectedFrom(doc.markdown, doc.path)
  const interview = doc.path.startsWith('docs/03-interview/') && !doc.path.endsWith('00-INDEX.md')
    ? interviewOutline(rendered.headings)
    : null
  writeJson(join(OUT, 'docs', `${doc.slug}.json`), basePage({
    kind: 'doc',
    url: doc.url,
    title: pageTitle(shown),
    description: doc.description,
    canonicalPath: doc.url,
    breadcrumbs: crumb,
    jsonLd: [
      breadcrumbLd(crumb),
      doc.path.startsWith('docs/02-learn/') || interview
        ? {
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: shown,
            description: doc.description,
            url: `${SITE}${doc.url}`,
            learningResourceType: interview ? 'Interview questions' : 'Lesson',
            isAccessibleForFree: true,
            inLanguage: 'en',
          }
        : null,
    ].filter(Boolean),
    doc: {
      section: doc.section,
      sectionLabel: sectionLabel(doc.section),
      stageLabel: stage ? stage[1] : null,
      html: rendered.html,
      headings: rendered.headings.filter((h) => h.level === 2 || h.level === 3).slice(0, 24),
      ...(interview ? { outline: interview.outline } : {}),
      related,
      ...(connected ? { connected } : {}),
      trackPlace: doc.path.startsWith('docs/02-learn/') && !doc.path.endsWith('00-INDEX.md'),
      ...nav,
    },
  }))
}

const packagePages = packages.map((pkg) => {
  const rows = examples
    .filter((e) => e.pkg === pkg)
    .sort((a, b) => a.studyGroup - b.studyGroup || a.studyOrder - b.studyOrder || a.path.localeCompare(b.path))
  return {
    pkg,
    role: PACKAGE_ROLE[pkg],
    count: rows.length,
    url: `/examples/${pkg}`,
    examples: rows.map(exampleSummary),
    chapter: chapterFor(rows),
  }
})

const interviewTopics = docs.filter((d) => d.path.startsWith('docs/03-interview/') && !d.path.endsWith('00-INDEX.md'))
const interviewIndex = docs.find((d) => d.path === 'docs/03-interview/00-INDEX.md')
const samplePaths = [
  'pkg1core/core1HelloWorld.java',
  'pkg1core/core19CollectionsDemo.java',
  'pkg7concurrency/concurrency6VirtualThreadsDemo.java',
]
const samples = samplePaths
  .map((path) => examples.find((example) => example.path === path))
  .filter(Boolean)
  .map((example) => ({
    className: example.className,
    path: example.path,
    href: example.url,
    role: example.role,
  }))
const versions = JAVA_VERSIONS.map((release) => ({
  label: `Java ${release.version}`,
  href: release.url,
}))
const projectTitles = projectCatalog.map((project) => ({ title: project.title }))
const plans = ['blind75', 'official75', 'interview150', 'top100'].map((folder) => ({
  label: { blind75: 'Blind 75', official75: 'LeetCode 75', interview150: 'Interview 150', top100: 'Top 100' }[folder],
  count: examples.filter((example) => example.path.includes(`/${folder}/`)).length,
  href: `/examples/pkg5leetcode#${folder}`,
}))

writeJson(join(OUT, 'home.json'), basePage({
  kind: 'home',
  url: '/',
  title: 'Learn Java. Think like an engineer. | JavaMastery',
  description: 'A Java curriculum from the first program through the JVM, concurrency, backend work, and interviews. Start at chapter 1, then open the matching source file.',
  canonicalPath: '/',
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JavaMastery',
    url: SITE,
    description: 'Learn Java from the first program through the JVM, concurrency, and interviews.',
    inLanguage: 'en',
  },
  home: {
    counts: {
      lessons: learnDocs.length,
      javaFiles: javaFiles.length,
      packages: packages.length,
      interviewTopics: interviewTopics.length,
    },
    start: learnDocs[0] ? { href: learnDocs[0].url, title: displayTitle(learnDocs[0].title) } : null,
    stages: stages.map(({ chapters, ...stage }) => stage),
    versions,
    samples,
    plans,
    interview: { href: interviewIndex?.url || '/learn', topics: interviewTopics.length },
    projects: projectTitles,
  },
}))

writeJson(join(OUT, 'versions.json'), basePage({
  kind: 'versions',
  url: VERSION_INDEX,
  title: 'Java versions | JavaMastery',
  description: 'Java 6 through Java 25, one page per release. Preview, incubator, and experimental features keep the status they had in that release.',
  canonicalPath: VERSION_INDEX,
  breadcrumbs: [
    { name: 'JavaMastery', href: '/' },
    { name: 'Java versions', href: VERSION_INDEX },
  ],
  jsonLd: breadcrumbLd([
    { name: 'JavaMastery', href: '/' },
    { name: 'Java versions', href: VERSION_INDEX },
  ]),
  catalog: JAVA_VERSIONS.map((release) => ({
    version: release.version,
    href: release.url,
    ga: release.ga,
    spec: release.spec,
    lts: release.lts,
    overview: release.overview,
  })),
}))

for (const release of JAVA_VERSIONS) {
  const crumbs = [
    { name: 'JavaMastery', href: '/' },
    { name: 'Java versions', href: VERSION_INDEX },
    { name: `Java ${release.version}`, href: release.url },
  ]
  writeJson(join(OUT, 'versions', `java-${release.version}.json`), basePage({
    kind: release.version === 25 ? 'java25' : 'version',
    url: release.url,
    title: `Java ${release.version} | JavaMastery`,
    description: release.description,
    canonicalPath: release.url,
    breadcrumbs: crumbs,
    jsonLd: breadcrumbLd(crumbs),
    release,
    ...(release.version === 25 ? {
      java25: {
        ga: '16 September 2025',
        spec: 'JSR 400',
        features: JAVA25_FEATURES,
        versions,
      },
    } : {}),
  }))
}

writeJson(join(OUT, 'learn.json'), basePage({
  kind: 'learn',
  url: '/learn',
  title: 'Learning path | JavaMastery',
  description: `${learnDocs.length} chapters in study order, from the first program through Spring and a browser client. Filename numbers stay stable. This page is the sequence.`,
  canonicalPath: '/learn',
  breadcrumbs: [
    { name: 'JavaMastery', href: '/' },
    { name: 'Learning path', href: '/learn' },
  ],
  jsonLd: breadcrumbLd([
    { name: 'JavaMastery', href: '/' },
    { name: 'Learning path', href: '/learn' },
  ]),
  learn: { stages },
}))

writeJson(join(OUT, 'examples.json'), basePage({
  kind: 'examples',
  url: '/examples',
  title: 'Java examples | JavaMastery',
  description: 'Java source in curriculum order, from the first program through Spring. Files are listed by study order, so pattern 2 comes before pattern 10.',
  canonicalPath: '/examples',
  breadcrumbs: [
    { name: 'JavaMastery', href: '/' },
    { name: 'Examples', href: '/examples' },
  ],
  jsonLd: breadcrumbLd([
    { name: 'JavaMastery', href: '/' },
    { name: 'Examples', href: '/examples' },
  ]),
  packages: packagePages.map(({ pkg, role, count, url }) => ({ pkg, role, count, url })),
}))

for (const page of packagePages) {
  const leetcodePage = page.pkg === 'pkg5leetcode'
  const solutionCount = leetcodePage ? page.examples.filter((item) => item.leetcode && !item.leetcode.helper).length : 0
  writeJson(join(OUT, 'examples', `${page.pkg}.json`), basePage({
    kind: 'package',
    url: page.url,
    title: leetcodePage ? 'LeetCode solutions | JavaMastery' : `${page.role} examples | JavaMastery`,
    description: leetcodePage
      ? `${solutionCount} Java solutions in pkg5leetcode, listed in the study-plan order published in the repository. Each page shows that source file.`
      : `${page.role}. ${page.count} files in ${page.pkg}, listed in study order. Single-file examples show the java command. Maven and Gradle examples say so.`,
    canonicalPath: page.url,
    breadcrumbs: [
      { name: 'JavaMastery', href: '/' },
      { name: 'Examples', href: '/examples' },
      { name: page.role, href: page.url },
    ],
    jsonLd: breadcrumbLd([
      { name: 'JavaMastery', href: '/' },
      { name: 'Examples', href: '/examples' },
      { name: page.role, href: page.url },
    ]),
    package: page,
  }))
}

for (const example of examples.filter((e) => e.url)) {
  const html = codeBlock(example.source, 'java')
  const lc = example.leetcode
  const modeLabel = {
    SINGLE_FILE: 'Single-file source launch',
    MAVEN: 'Maven module',
    GRADLE: 'Gradle build',
    OPTIONAL_DEPENDENCY: 'Runs without a driver. The database demo needs an optional JDBC driver.',
    NON_RUNNABLE: 'Read this file. It has no standalone main method.',
  }[example.runMode]
  const shown = lc?.title || example.className
  const number = lc?.problemNumber ? ` LC ${lc.problemNumber}` : ''
  writeJson(join(OUT, 'examples', example.pkg, `${example.className}.json`), basePage({
    kind: 'example',
    url: example.url,
    title: lc ? `${shown}${number} · ${lc.plan} | JavaMastery` : `${example.className} | JavaMastery`,
    description: lc
      ? `${lc.plan}. ${example.className}.java. ${lc.approach || lc.description || 'Java solution from the curriculum.'}`.replace(/\s+/g, ' ').slice(0, 180)
      : `${example.role}. ${modeLabel}${example.runCommand ? `. Command: ${example.runCommand}.` : '.'}`,
    canonicalPath: example.url,
    breadcrumbs: [
      { name: 'JavaMastery', href: '/' },
      { name: 'Examples', href: '/examples' },
      { name: example.role, href: `/examples/${example.pkg}` },
      { name: shown, href: example.url },
    ],
    jsonLd: breadcrumbLd([
      { name: 'JavaMastery', href: '/' },
      { name: 'Examples', href: '/examples' },
      { name: example.role, href: `/examples/${example.pkg}` },
      { name: shown, href: example.url },
    ]),
    example: {
      ...exampleSummary(example),
      ...(lc ? {
        leetcode: {
          ...exampleSummary(example).leetcode,
          approach: lc.approach,
          complexity: lc.complexity,
          description: lc.description,
          declaredPackage: lc.declaredPackage,
          previous: example.leetcodePrevious,
          next: example.leetcodeNext,
        },
      } : {}),
      modeLabel,
      html,
      source: example.source,
    },
  }))
}

writeJson(join(OUT, 'projects.json'), basePage({
  kind: 'projects',
  url: '/projects',
  title: 'Projects | JavaMastery',
  description: 'Five hands-on labs unlocked after the matching chapter: a gradebook, an OOP library, a JDK HTTP server, a Spring Boot notes API, and a small web client.',
  canonicalPath: '/projects',
  breadcrumbs: [
    { name: 'JavaMastery', href: '/' },
    { name: 'Projects', href: '/projects' },
  ],
  jsonLd: breadcrumbLd([
    { name: 'JavaMastery', href: '/' },
    { name: 'Projects', href: '/projects' },
  ]),
  projects: projectCatalog,
}))

writeJson(join(OUT, 'bookmarks.json'), basePage({
  kind: 'bookmarks',
  url: '/bookmarks',
  title: 'Bookmarks | JavaMastery',
  description: 'Pages you save in this browser.',
  canonicalPath: '/bookmarks',
  robots: 'noindex,follow',
  bookmarks: true,
}))

const searchIndex = buildSearchIndex()
writeJson(join(UI_ROOT, 'public', 'content', 'search-index.json'), searchIndex)
console.log(`Search index: ${searchIndex.length} documents, ${Buffer.byteLength(JSON.stringify(searchIndex))} bytes`)

const urls = [
  SITE,
  `${SITE}/learn`,
  `${SITE}/examples`,
  `${SITE}/projects`,
  `${SITE}${VERSION_INDEX}`,
  ...JAVA_VERSIONS.map((release) => `${SITE}${release.url}`),
  ...docs.map((d) => `${SITE}${d.url}`),
  ...packagePages.map((p) => `${SITE}${p.url}`),
  ...examples.filter((e) => e.url).map((e) => `${SITE}${e.url}`),
]
if (new Set(urls).size !== urls.length) throw new Error('Duplicate sitemap URLs')
if (unresolvedLinks.length) {
  throw new Error(`Unresolved curriculum links:\n${unresolvedLinks.slice(0, 40).join('\n')}`)
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(join(UI_ROOT, 'public', 'sitemap.xml'), sitemap)
writeFileSync(join(UI_ROOT, 'public', 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /bookmarks\n\nSitemap: ${SITE}/sitemap.xml\n`)

if (mdFiles.length !== 89) throw new Error(`Expected 89 markdown files, found ${mdFiles.length}`)
if (javaFiles.length !== 440) throw new Error(`Expected 440 Java files, found ${javaFiles.length}`)
for (const release of JAVA_VERSIONS) {
  for (const example of [...release.examples, ...release.features.map((feature) => feature.example).filter(Boolean)]) {
    const source = `${example.href.replace(/^\/examples\//, '')}.java`
    if (!existsSync(join(FORGE, source))) throw new Error(`Version example missing: ${source}`)
  }
}
const leetcodeSources = javaFiles.filter((file) => rel(file).startsWith('pkg5leetcode/') && rel(file).endsWith('.java'))
if (leetcodeSources.length !== 264) throw new Error(`Expected 264 LeetCode Java files, found ${leetcodeSources.length}`)
for (const example of examples) {
  if (example.pkg !== 'pkg5leetcode' || example.leetcode?.helper) continue
  if (!example.leetcode?.title || !example.leetcode.problemNumber) throw new Error(`LeetCode metadata missing for ${example.path}`)
}
if (packages.length !== 22) throw new Error(`Expected 22 packages, found ${packages.length}`)

console.log(`Content: ${docs.length} docs, ${examples.length} Java files, ${packages.length} packages, ${urls.length} sitemap URLs`)

function sectionLabel(section) {
  const labels = {
    '01-orientation': 'Orientation',
    '02-learn': 'Learn',
    '03-interview': 'Interview',
    '04-reference': 'Reference',
    '05-quick-ref': 'Quick reference',
    '06-career': 'Career',
    '07-projects': 'Projects',
  }
  return labels[section] || section
}

function sectionHref(section) {
  if (section === '02-learn') return '/learn'
  if (section === '07-projects') return '/projects'
  const index = docs.find((d) => d.section === section && d.path.endsWith('00-INDEX.md'))
  return index ? index.url : '/learn'
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

function exampleSummary(example) {
  return {
    path: example.path,
    pkg: example.pkg,
    className: example.className,
    role: example.role,
    studyOrder: example.studyOrder,
    runMode: example.runMode,
    runCommand: example.runCommand,
    javaVersion: example.javaVersion,
    ...(example.requiredJava ? { requiredJava: example.requiredJava, exampleType: example.exampleType } : {}),
    dependencies: example.dependencies,
    linkedLesson: example.linkedLesson,
    url: example.url,
    ...(example.leetcode ? {
      leetcode: {
        plan: example.leetcode.plan,
        planId: example.leetcode.planId,
        problemNumber: example.leetcode.problemNumber,
        title: example.leetcode.title,
        difficulty: example.leetcode.difficulty,
        grouping: example.leetcode.grouping,
        helper: example.leetcode.helper,
      },
    } : {}),
  }
}

function chapterFor(rows) {
  const counts = new Map()
  for (const row of rows) {
    if (!row.linkedLesson) continue
    counts.set(row.linkedLesson, (counts.get(row.linkedLesson) || 0) + 1)
  }
  let best = null
  let bestCount = 0
  for (const [href, count] of counts) {
    if (count > bestCount) {
      best = href
      bestCount = count
    }
  }
  if (!best) return null
  const doc = docs.find((item) => item.url === best)
  return { href: best, title: doc ? displayTitle(doc.title) : best }
}

function loadProjects() {
  return readdirSync(join(FORGE, 'projects')).sort((a, b) => a.localeCompare(b))
    .filter((name) => statSync(join(FORGE, 'projects', name)).isDirectory())
    .map((dir) => {
      const currentDoc = `projects/${dir}/README.md`
      const readmePath = join(FORGE, currentDoc)
      const markdown = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : ''
      const raw = firstTitle(markdown, dir)
      return {
        dir,
        title: displayTitle(raw.replace(/^Project\s+\d+\s*[—–\-:|→>]+\s*/i, '')),
        description: summarize(markdown, dir),
        href: `/projects#${dir}`,
        lesson: projectLesson(markdown, currentDoc),
      }
    })
}

function projectLesson(markdown, currentDoc) {
  const re = /\[[^\]]*]\(([^)]+\.md)\)/g
  let match
  while ((match = re.exec(markdown))) {
    const resolved = resolveDoc(match[1], currentDoc)
    if (!resolved || !resolved.url.startsWith('/docs/02-learn--')) continue
    const target = docs.find((item) => item.url === resolved.url.split('#')[0])
    if (!target) continue
    return { href: target.url, title: displayTitle(target.title) }
  }
  return null
}

function connectedFrom(markdown, currentDoc) {
  const interview = []
  const reference = []
  const projects = []
  const seen = new Set()
  const re = /\[[^\]]*]\(([^)\s]+)\)/g
  let match
  while ((match = re.exec(markdown))) {
    const href = match[1]
    if (href.startsWith('http')) continue
    if (href.includes('/projects/') && href.endsWith('.md')) {
      const folder = href.match(/projects\/([^/]+)\//)
      const project = folder ? projectCatalog.find((item) => item.dir === folder[1]) : null
      if (project && !seen.has(project.href)) {
        seen.add(project.href)
        projects.push({ href: project.href, title: project.title })
      }
      continue
    }
    if (!href.includes('.md')) continue
    const resolved = resolveDoc(href, currentDoc)
    if (!resolved || seen.has(resolved.url)) continue
    const target = docs.find((item) => item.url === resolved.url.split('#')[0])
    if (!target) continue
    const item = { href: resolved.url, title: displayTitle(target.title) }
    if (target.path.startsWith('docs/03-interview/')) {
      seen.add(resolved.url)
      interview.push(item)
    } else if (target.path.startsWith('docs/04-reference/')) {
      seen.add(resolved.url)
      reference.push(item)
    }
  }
  const connected = {
    interview: interview.slice(0, 4),
    reference: reference.slice(0, 4),
    projects: projects.slice(0, 4),
  }
  if (!connected.interview.length && !connected.reference.length && !connected.projects.length) return null
  return connected
}

function searchDoc(partial) {
  const doc = {}
  for (const [key, value] of Object.entries(partial)) {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) continue
    doc[key] = value
  }
  return doc
}

function leetcodeFolder(path) {
  const parts = path.split('/')
  if (parts.length < 3) return ''
  return parts[1]
}

function leetcodePlan(path) {
  const track = LEETCODE_TRACKS.find((item) => item.folder === leetcodeFolder(path))
  return track ? track.label : 'Starter'
}

function markdownSection(markdown, heading) {
  const start = markdown.indexOf(heading)
  if (start < 0) return ''
  const rest = markdown.slice(start + heading.length)
  const next = rest.search(/\n## /)
  return next < 0 ? rest : rest.slice(0, next)
}

function leetcodeGuide(markdown) {
  const starterOrder = []
  const starterPattern = new Map()
  for (const line of markdownSection(markdown, '## Root starter set').split(/\r?\n/)) {
    const row = line.match(/^\|\s*`([^`]+)`\s*\|\s*(\d+)\s*\|\s*([^|]+)\|/)
    if (!row) continue
    starterOrder.push(row[1])
    starterPattern.set(row[1], row[3].trim())
  }
  const blindOrder = []
  const blindCategory = new Map()
  for (const line of markdownSection(markdown, '## Blind 75 index').split(/\r?\n/)) {
    const row = line.match(/^\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|/)
    if (!row) continue
    const category = row[1].trim()
    for (const match of row[2].matchAll(/(\d+)/g)) {
      if (blindCategory.has(match[1])) continue
      blindCategory.set(match[1], category)
      blindOrder.push(match[1])
    }
  }
  const officialTopic = new Map()
  for (const line of markdownSection(markdown, '## Official LeetCode 75 topics').split(/\r?\n/)) {
    const row = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+)\|/)
    if (!row || !/\d/.test(row[2])) continue
    const topic = row[1].replace(/\*\*/g, '').trim()
    for (const match of row[2].matchAll(/(\d+)/g)) {
      if (!officialTopic.has(match[1])) officialTopic.set(match[1], topic)
    }
  }
  return { starterOrder, starterPattern, blindOrder, blindCategory, officialTopic }
}

function leetcodeHeader(source) {
  let title = null
  let problemNumber = null
  let difficulty = null
  let approach = null
  let complexity = null
  const prose = []
  let inBlock = false
  for (const line of source.split(/\r?\n/)) {
    const approachMatch = line.match(/APPROACH:\s*(.+)/)
    if (approachMatch) approach = approachMatch[1].trim()
    const complexityMatch = line.match(/COMPLEXITY:\s*(.+)/)
    if (complexityMatch) complexity = complexityMatch[1].trim()
    const oneLine = line.match(/^\s*\/\*\*\s*LC\s+(\d+)\s+(.+?)\s*\*\/\s*$/)
    if (oneLine) {
      problemNumber = oneLine[1]
      title = oneLine[2].trim()
      break
    }
    if (line.includes('/*')) inBlock = true
    if (!inBlock) {
      if (/^(public|class)\b/.test(line.trim())) break
      continue
    }
    const comment = line.match(/^\s*\*\s?(.*)$/)
    if (!comment) {
      if (line.includes('*/')) break
      continue
    }
    const text = comment[1].replace(/\s+/g, ' ').trim()
    if (!text || text === '/' || /^-+$/.test(text)) continue
    if (/^(APPROACH|COMPLEXITY):/i.test(text)) continue
    const named = text.match(/^LeetCode\s+(\d+)\s*:\s*(.+)$/i)
    if (named && !title) {
      problemNumber = named[1]
      const diff = named[2].match(/^(.*?)(?:\s+\((Easy|Medium|Hard)\))\s*$/)
      if (diff) {
        title = diff[1].trim()
        difficulty = diff[2]
      } else {
        title = named[2].trim()
      }
      continue
    }
    const pipe = text.match(/^(.+?)\s*\|\s*LC\s+(\d+)\s*$/)
    if (pipe && !title) {
      title = pipe[1].trim()
      problemNumber = pipe[2]
      continue
    }
    if (title) prose.push(text)
    if (line.includes('*/')) break
  }
  const declared = source.match(/^package\s+([\w.]+);/m)
  return {
    title,
    problemNumber,
    difficulty,
    approach,
    complexity,
    description: prose.join(' ').trim() || null,
    declaredPackage: declared ? declared[1] : null,
  }
}

function annotateLeetcode(examples) {
  const guide = leetcodeGuide(readFileSync(join(FORGE, 'docs/04-reference/14-LeetCode.md'), 'utf8'))
  const groups = LEETCODE_TRACKS.map(() => [])
  for (const example of examples) {
    if (example.pkg !== 'pkg5leetcode') continue
    const folder = leetcodeFolder(example.path)
    const trackIndex = Math.max(0, LEETCODE_TRACKS.findIndex((item) => item.folder === folder))
    const track = LEETCODE_TRACKS[trackIndex]
    const header = leetcodeHeader(example.source)
    const helper = folder === 'common'
    let grouping = null
    if (!helper && track.id === 'starter') {
      const pattern = guide.starterPattern.get(example.className)
      if (pattern) grouping = { label: 'Pattern', name: pattern }
    } else if (!helper && track.id === 'blind75' && header.problemNumber) {
      const category = guide.blindCategory.get(header.problemNumber)
      if (category) grouping = { label: 'Category', name: category }
    } else if (!helper && track.id === 'official75' && header.problemNumber) {
      const topic = guide.officialTopic.get(header.problemNumber)
      if (topic) grouping = { label: 'Topic', name: topic }
    }
    if (helper && !header.title) {
      const sentence = example.source.match(/^\s*\*\s+(.+)$/m)
      header.title = sentence ? sentence[1].replace(/\s+/g, ' ').trim() : null
    }
    example.leetcode = {
      plan: track.label,
      planId: track.id,
      problemNumber: helper ? null : header.problemNumber,
      title: header.title,
      difficulty: helper ? null : header.difficulty,
      grouping,
      approach: helper ? null : header.approach,
      complexity: helper ? null : header.complexity,
      description: header.description,
      declaredPackage: header.declaredPackage,
      helper,
    }
    const listed = track.id === 'starter'
      ? guide.starterOrder.indexOf(example.className)
      : track.id === 'blind75'
        ? guide.blindOrder.indexOf(header.problemNumber)
        : -1
    example.studyGroup = trackIndex
    example.studyRank = listed >= 0 ? listed : 100000 + Number(header.problemNumber || 0)
    groups[trackIndex].push(example)
  }
  const ordered = []
  for (const group of groups) {
    group.sort((a, b) => a.studyRank - b.studyRank || a.path.localeCompare(b.path))
    group.forEach((example, index) => {
      example.studyOrder = index
    })
    ordered.push(...group)
  }
  for (let i = 0; i < ordered.length; i++) {
    const previous = ordered[i - 1]
    const next = ordered[i + 1]
    ordered[i].leetcodePrevious = previous
      ? { href: previous.url, title: previous.leetcode.title || previous.className }
      : null
    ordered[i].leetcodeNext = next
      ? { href: next.url, title: next.leetcode.title || next.className }
      : null
  }
}

function versionNotes(source) {
  const notes = []
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*\*\s+-\s+([^:]+?)\s*:\s*(.+)$/)
    if (!match) continue
    const name = match[1].replace(/\s+/g, ' ').trim()
    const why = match[2].replace(/\s+/g, ' ').trim()
    if (name && name.length <= 80) notes.push({ name, why })
  }
  return notes
}

function isInterviewQuestion(text) {
  const plainText = text.replace(/<[^>]+>/g, '').trim()
  return /^\d+[a-z]?\.\s/i.test(plainText) || /^puzzle\s+\d+\b/i.test(plainText) || plainText.includes('?')
}

function interviewOutline(headings) {
  const outline = []
  for (const heading of headings) {
    const text = heading.text.replace(/<[^>]+>/g, '').trim()
    if (heading.level === 3 && isInterviewQuestion(text)) {
      outline.push({ id: heading.id, text, kind: 'question' })
    } else if (heading.level === 2 && !/^(detailed questions|puzzles)$/i.test(text)) {
      outline.push({ id: heading.id, text, kind: 'section' })
    }
  }
  return { outline }
}

function questionTitle(text) {
  return text.replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim()
}

function shortAnswer(markdown, headingText) {
  const start = markdown.indexOf(headingText)
  if (start < 0) return ''
  const slice = markdown.slice(start, start + 500)
  const match = slice.match(/\*\*Short:\*\*\s*([^\n]+)/)
  return match ? plain(match[1]).slice(0, 180) : ''
}

function buildSearchIndex() {
  const documents = []
  for (const doc of docs) {
    const type = doc.path.startsWith('docs/02-learn/')
      ? 'lesson'
      : doc.path.startsWith('docs/03-interview/')
        ? 'interview'
        : 'reference'
    if (!doc.path.startsWith('docs/')) continue
    const shown = displayTitle(doc.title)
    const headings = (doc.searchHeadings || [])
      .filter((heading) => (type === 'interview' ? heading.level === 2 : heading.level === 2 || heading.level === 3))
      .map((heading) => heading.text)
      .join(' ')
      .slice(0, 400)
    const stage = stageOf(chapterNo(doc))
    documents.push(searchDoc({
      id: `${type}:${doc.url}`,
      type,
      title: shown,
      url: doc.url,
      description: doc.description,
      hint: stage ? stage[1] : sectionLabel(doc.section),
      topic: stage ? stage[1] : sectionLabel(doc.section),
      headings,
    }))
    if (!doc.path.startsWith('docs/03-interview/') || doc.path.endsWith('00-INDEX.md')) continue
    for (const heading of doc.searchHeadings || []) {
      if (heading.level !== 3 || !heading.text.includes('?')) continue
      const title = questionTitle(heading.text)
      documents.push(searchDoc({
        id: `interview:${doc.url}#${heading.id}`,
        type: 'interview',
        title,
        url: `${doc.url}#${heading.id}`,
        description: shortAnswer(doc.markdown, heading.text),
        hint: shown,
        topic: shown,
      }))
    }
    for (const line of doc.markdown.split(/\r?\n/)) {
      const rapid = line.match(/^\d+\.\s+(.+?)\s+→\s+(.+)$/)
      if (!rapid) continue
      documents.push(searchDoc({
        id: `interview:${doc.url}:rapid:${documents.length}`,
        type: 'interview',
        title: rapid[1].trim(),
        url: doc.url,
        description: plain(rapid[2]).slice(0, 180),
        hint: shown,
        topic: shown,
      }))
    }
  }

  for (const example of examples) {
    if (!example.url) continue
    if (example.pkg === 'pkg2versions' && example.javaVersion) {
      const label = `Java ${example.javaVersion}`
      documents.push(searchDoc({
        id: `version:${example.url}`,
        type: 'version',
        title: label,
        url: example.url,
        file: `${example.className}.java`,
        hint: example.path,
        pkg: example.pkg,
        topic: label,
        keywords: [example.path, example.className],
      }))
      for (const note of versionNotes(example.source)) {
        documents.push(searchDoc({
          id: `version:${example.url}:${note.name}`,
          type: 'version',
          title: note.name,
          url: example.url,
          description: `${label}. ${note.why}`.slice(0, 180),
          hint: label,
          topic: label,
          keywords: [label, note.name],
        }))
      }
      continue
    }
    const lc = example.leetcode
    const leetcode = lc && !lc.helper
    const number = leetcode ? lc.problemNumber : null
    documents.push(searchDoc({
      id: `${leetcode ? 'leetcode' : 'example'}:${example.path}`,
      type: leetcode ? 'leetcode' : 'example',
      title: lc?.title || `${example.className}.java`,
      url: example.url,
      description: [lc?.description, lc?.approach, lc?.complexity].filter(Boolean).join(' ').slice(0, 180),
      file: `${example.className}.java`,
      hint: lc ? `${lc.plan} · ${example.path}` : `${example.role} · ${example.path}`,
      topic: lc ? lc.plan : example.role,
      pkg: example.pkg,
      keywords: [
        example.path,
        example.className,
        example.role,
        example.exampleType,
        example.requiredJava ? `Requires Java ${example.requiredJava}` : null,
        lc?.plan,
        lc?.grouping?.name,
        lc?.difficulty,
        number ? `LC ${number}` : null,
      ].filter(Boolean),
    }))
  }

  for (const release of JAVA_VERSIONS) {
    documents.push(searchDoc({
      id: `version:${release.url}`,
      type: 'version',
      title: `Java ${release.version}`,
      url: release.url,
      description: release.description.slice(0, 180),
      hint: release.lts ? `${release.spec} · long-term support` : release.spec,
      topic: `Java ${release.version}`,
      keywords: [
        `Java ${release.version}`,
        `JDK ${release.version}`,
        release.spec,
        ...release.examples.flatMap((example) => [example.title, example.exampleType, `Requires Java ${example.requiredJava}`]),
      ],
    }))
    for (const feature of release.features) {
      documents.push(searchDoc({
        id: `version:${release.url}#${feature.id}`,
        type: 'version',
        title: feature.name,
        url: `${release.url}#${feature.id}`,
        description: `${feature.name}. ${feature.summary}`.slice(0, 180),
        hint: feature.jep ? `JEP ${feature.jep} · ${feature.status}` : feature.status,
        topic: `Java ${release.version}`,
        keywords: [
          `Java ${release.version}`,
          feature.jep ? `JEP ${feature.jep}` : '',
          feature.status,
          feature.category,
          feature.example?.title,
        ].filter(Boolean),
      }))
    }
  }

  for (const project of projectCatalog) {
    documents.push(searchDoc({
      id: `project:${project.dir}`,
      type: 'project',
      title: project.title,
      url: project.href,
      description: project.description,
      hint: `projects/${project.dir}`,
      topic: project.lesson?.title,
    }))
  }
  return documents
}
