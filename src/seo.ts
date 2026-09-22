import { SITE_ORIGIN, type PageData } from './types'

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderHead(page: PageData): string {
  const canonical = `${SITE_ORIGIN}${page.canonicalPath === '/' ? '' : page.canonicalPath}`
  const image = `${SITE_ORIGIN}/og.svg`
  const type = page.kind === 'home' ? 'website' : 'article'
  const ld = page.jsonLd ? JSON.stringify(page.jsonLd).replace(/</g, '\\u003c') : ''
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta name="robots" content="${esc(page.robots)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    ld ? `<script type="application/ld+json" id="ld-json">${ld}</script>` : '',
  ].filter(Boolean).join('\n')
}

export function applyHead(page: PageData): void {
  document.title = page.title
  setMeta('name', 'description', page.description)
  setMeta('name', 'robots', page.robots)
  setMeta('property', 'og:title', page.title)
  setMeta('property', 'og:description', page.description)
  setMeta('property', 'og:url', `${SITE_ORIGIN}${page.canonicalPath === '/' ? '' : page.canonicalPath}`)
  setMeta('property', 'og:type', page.kind === 'home' ? 'website' : 'article')
  setMeta('property', 'og:image', `${SITE_ORIGIN}/og.svg`)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', page.title)
  setMeta('name', 'twitter:description', page.description)
  setMeta('name', 'twitter:image', `${SITE_ORIGIN}/og.svg`)
  const canonical = `${SITE_ORIGIN}${page.canonicalPath === '/' ? '' : page.canonicalPath}`
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = canonical
  const id = 'ld-json'
  let script = document.getElementById(id) as HTMLScriptElement | null
  if (!page.jsonLd) {
    script?.remove()
    return
  }
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(page.jsonLd)
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
