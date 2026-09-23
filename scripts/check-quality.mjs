/**
 * Static production checks over prerendered HTML.
 * Fails the build on broken internal links, missing fragments, duplicate IDs,
 * invalid public SEO, sitemap mismatches, and missing local assets.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const root = process.cwd()
const dist = join(root, 'dist')
const origin = (process.env.VITE_SITE_URL || 'https://javamastery.srinivasrao.co.in').replace(/\/$/, '')
const failures = []

function fail(message) {
  failures.push(message)
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'server') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else acc.push(full)
  }
  return acc
}

function routeOf(file) {
  const rel = relative(dist, file).replaceAll('\\', '/')
  if (rel === 'index.html') return '/'
  if (rel === '404.html') return '/404'
  if (!rel.endsWith('.html')) return null
  return `/${rel.slice(0, -'.html'.length)}`
}

function classify(route) {
  if (route === '/') return 'homepage'
  if (route === '/learn') return 'learning'
  if (route === '/examples') return 'examples'
  if (route === '/projects') return 'projects'
  if (route === '/bookmarks') return 'bookmarks'
  if (route === '/versions') return 'version'
  if (route === '/concepts') return 'concepts'
  if (route === '/404') return 'other'
  if (route.startsWith('/concepts/')) return 'concept'
  if (route.startsWith('/versions/java-')) return 'java-version'
  if (route.startsWith('/docs/03-interview')) return 'interview'
  if (route.startsWith('/docs/04-reference')) return 'reference'
  if (route.startsWith('/docs/')) return 'lesson'
  if (route.startsWith('/examples/pkg5leetcode/')) return 'leetcode'
  if (route.startsWith('/examples/pkg')) return route.split('/').length === 3 ? 'package' : 'example'
  if (route.startsWith('/examples/')) return 'example'
  return 'other'
}

const htmlFiles = walk(dist).filter((file) => file.endsWith('.html'))
const pages = new Map()
for (const file of htmlFiles) {
  const route = routeOf(file)
  if (!pages.has(route)) pages.set(route, file)
  else fail(`duplicate route file ${route}`)
}

function visibleHtml(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
}

function idsOf(html) {
  const ids = []
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) ids.push(match[1])
  return ids
}

function isAsset(href) {
  return /\.(?:css|js|svg|png|jpe?g|gif|webp|ico|woff2?|map)(?:\?|$)/i.test(href)
}

function attrs(html, name) {
  return [...html.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((match) => match[1])
}

const pageHtml = new Map()
const pageIds = new Map()
for (const [route, file] of pages) {
  const html = visibleHtml(readFileSync(file, 'utf8'))
  pageHtml.set(route, html)
  const ids = idsOf(html)
  pageIds.set(route, new Set(ids))
  const seen = new Set()
  for (const id of ids) {
    if (seen.has(id)) fail(`duplicate id ${route}#${id}`)
    seen.add(id)
  }
}

function resolveRoute(from, href) {
  if (!href || href.startsWith('mailto:') || href.startsWith('javascript:')) return null
  if (href.startsWith('http://') || href.startsWith('https://')) {
    if (!href.startsWith(origin)) return { external: href }
    const rest = href.slice(origin.length) || '/'
    return splitHref(rest)
  }
  if (href.startsWith('//')) return { external: href }
  if (href.startsWith('#')) return { route: from, hash: href.slice(1) }
  if (!href.startsWith('/')) return { broken: href, relative: true }
  return splitHref(href)
}

function splitHref(href) {
  const hashAt = href.indexOf('#')
  const queryAt = href.indexOf('?')
  const cut = [hashAt, queryAt].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? href.length
  const route = href.slice(0, cut) || '/'
  const hash = hashAt >= 0 ? decodeHash(href.slice(hashAt + 1).split('?')[0]) : ''
  const query = queryAt >= 0
  return { route: route.length > 1 && route.endsWith('/') ? route.slice(0, -1) : route, hash, query }
}

function decodeHash(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const counts = {}
for (const route of pages.keys()) {
  const kind = classify(route)
  counts[kind] = (counts[kind] || 0) + 1
}

for (const [route, html] of pageHtml) {
  if (route === '/404') continue
  const titles = html.match(/<title>[^<]*<\/title>/g) || []
  if (titles.length !== 1 || titles[0] === '<title></title>') fail(`title ${route}`)
  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1] || ''
  const robots = (html.match(/name="robots" content="([^"]+)"/) || [])[1] || ''
  const h1 = (html.match(/<h1\b/g) || []).length
  if (h1 !== 1) fail(`h1 ${h1} ${route}`)
  if (route === '/bookmarks') {
    if (!robots.includes('noindex')) fail('bookmarks indexable')
  } else {
    if (!canonical.startsWith(`${origin}/`) && canonical !== origin) fail(`canonical ${route}`)
    if (canonical.includes('#')) fail(`canonical fragment ${route}`)
    if (robots.includes('noindex')) fail(`public noindex ${route}`)
    if (!html.includes('property="og:title"')) fail(`og title ${route}`)
    if (!html.includes('property="og:description"')) fail(`og description ${route}`)
    if (!html.includes('property="og:url"')) fail(`og url ${route}`)
    if (!html.includes('name="description"')) fail(`description ${route}`)
  }
  const hrefs = attrs(html, 'href')
  const srcs = attrs(html, 'src')
  for (const ref of [...hrefs, ...srcs]) {
    if (/localhost|127\.0\.0\.1/i.test(ref)) fail(`localhost ${route} -> ${ref}`)
    if (/^[A-Za-z]:[\\/]|file:|JavaForge[\\/]/.test(ref)) fail(`filesystem path ${route} -> ${ref}`)
  }

  for (const href of hrefs) {
    const target = resolveRoute(route, href)
    if (!target || target.external) continue
    if (target.relative || target.broken) {
      fail(`relative link ${route} -> ${href}`)
      continue
    }
    if (isAsset(href)) {
      const file = join(dist, decodeHash(target.route.slice(1)).split('?')[0])
      if (!existsSync(file)) fail(`missing asset ${route} -> ${href}`)
      continue
    }
    if (target.query) fail(`query link ${route} -> ${href}`)
    if (target.route === '/search' || target.route.startsWith('/search/')) fail(`search route ${route}`)
    if (!pages.has(target.route)) {
      fail(`broken link ${route} -> ${target.route}${target.hash ? `#${target.hash}` : ''}`)
      continue
    }
    if (target.hash && !pageIds.get(target.route).has(target.hash)) {
      fail(`missing fragment ${route} -> ${target.route}#${target.hash}`)
    }
  }
  for (const src of attrs(html, 'src')) {
    if (!src.startsWith('/') || src.startsWith('//')) continue
    const file = join(dist, decodeHash(src.slice(1)).split('?')[0])
    if (!existsSync(file)) fail(`missing asset ${route} -> ${src}`)
  }
  for (const labelled of attrs(html, 'aria-labelledby')) {
    for (const id of labelled.split(/\s+/)) {
      if (id && !pageIds.get(route).has(id)) fail(`aria-labelledby ${route} -> ${id}`)
    }
  }
  for (const described of attrs(html, 'aria-describedby')) {
    for (const id of described.split(/\s+/)) {
      if (id && !pageIds.get(route).has(id)) fail(`aria-describedby ${route} -> ${id}`)
    }
  }
  for (const controls of attrs(html, 'aria-controls')) {
    if (controls && !pageIds.get(route).has(controls)) fail(`aria-controls ${route} -> ${controls}`)
  }
}

const sitemapFile = join(dist, 'sitemap.xml')
if (!existsSync(sitemapFile)) fail('sitemap missing')
else {
  const sitemap = readFileSync(sitemapFile, 'utf8')
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  const seen = new Set()
  for (const loc of locs) {
    if (seen.has(loc)) fail(`duplicate sitemap ${loc}`)
    seen.add(loc)
    if (loc.includes('#')) fail(`sitemap fragment ${loc}`)
    if (!loc.startsWith(`${origin}/`) && loc !== origin) fail(`sitemap origin ${loc}`)
    const route = loc === origin ? '/' : loc.slice(origin.length)
    if (route === '/bookmarks' || route.startsWith('/search')) fail(`sitemap private ${route}`)
    if (!pages.has(route)) fail(`sitemap page missing ${route}`)
  }
  for (const [route, html] of pageHtml) {
    if (route === '/404' || route === '/bookmarks') continue
    if ((html.match(/name="robots" content="([^"]+)"/) || [])[1]?.includes('noindex')) continue
    const loc = route === '/' ? origin : `${origin}${route}`
    if (!seen.has(loc)) fail(`indexable page missing from sitemap ${route}`)
  }
}

const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : ''
if (!robots.includes('Disallow: /bookmarks')) fail('robots bookmarks')
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) fail('robots sitemap')
if (!existsSync(join(dist, 'favicon.svg'))) fail('favicon')
if (!existsSync(join(dist, 'og.svg'))) fail('og image')
const searchFile = join(dist, 'content', 'search-index.json')
if (!existsSync(searchFile)) fail('search index')
else {
  const index = JSON.parse(readFileSync(searchFile, 'utf8'))
  if (!Array.isArray(index) || index.length === 0) fail('search index shape')
  else {
    for (const doc of index) {
      if (typeof doc?.url !== 'string' || !doc.url.startsWith('/')) {
        fail(`search url ${doc?.id || ''}`)
        continue
      }
      const { route, hash } = splitHref(doc.url)
      if (route === '/search' || route === '/bookmarks') fail(`search private ${doc.url}`)
      if (!pages.has(route)) fail(`search destination ${doc.url}`)
      else if (hash && !pageIds.get(route).has(hash)) fail(`search fragment ${doc.url}`)
    }
  }
}

const representative = [
  '/', '/learn',
  '/docs/02-learn--01-GettingStarted', '/docs/02-learn--26-Concurrency', '/docs/02-learn--21-JavaVersions',
  '/examples', '/examples/pkg1core', '/examples/pkg10networking',
  '/examples/pkg5leetcode', '/examples/pkg5leetcode/blind75_LC1TwoSum', '/examples/pkg5leetcode/official75_LC206ReverseLinkedList',
  '/docs/03-interview--03-Collections', '/docs/03-interview--01-CoreJava', '/docs/03-interview--17-PrintPuzzles',
  '/projects', '/bookmarks', '/versions',
  '/versions/java-6', '/versions/java-8', '/versions/java-17', '/versions/java-21', '/versions/java-25',
]
for (const route of representative) {
  if (!pages.has(route)) fail(`missing representative ${route}`)
}
const fragments = [
  ['/docs/03-interview--01-CoreJava', 'q5'],
  ['/versions/java-25', 'jep-505'],
  ['/versions/java-10', 'jep-286'],
  ['/projects', '04-notes-api'],
]
for (const [route, id] of fragments) {
  if (!pageIds.get(route)?.has(id)) fail(`missing fragment ${route}#${id}`)
}
for (const version of [6, 7, 8, 17, 21, 24]) {
  const html = pageHtml.get(`/versions/java-${version}`) || ''
  if (!html.includes(`href="/versions/java-${version + 1}"`)) fail(`version next ${version}`)
}
for (const version of [7, 8, 17, 21, 25]) {
  const html = pageHtml.get(`/versions/java-${version}`) || ''
  if (!html.includes(`href="/versions/java-${version - 1}"`)) fail(`version previous ${version}`)
}

const countsLine = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).map(([key, value]) => `${key}=${value}`).join(' ')
console.log(`Quality: ${pages.size} html routes, sitemap checked. ${countsLine}`)
if (failures.length) {
  console.error(failures.slice(0, 80).join('\n'))
  if (failures.length > 80) console.error(`... ${failures.length - 80} more`)
  console.error(`${failures.length} quality failures`)
  process.exit(1)
}
console.log('Quality checks passed')
