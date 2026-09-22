#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { pathToFileURL } from 'url'

const root = process.cwd()
const template = readFileSync(join(root, 'dist', 'index.html'), 'utf8')
const server = await import(pathToFileURL(join(root, 'dist', 'server', 'entry-server.js')).href)

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir).sort((a, b) => a.localeCompare(b))) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (entry.endsWith('.json')) acc.push(full)
  }
  return acc
}

const pages = walk(join(root, 'public', 'content', 'pages'))
let count = 0
for (const file of pages) {
  const page = JSON.parse(readFileSync(file, 'utf8'))
  const html = server.render(page.url, page)
  const head = server.renderHead(page)
  const payload = JSON.stringify(page).replace(/</g, '\\u003c')
  // Function replacements keep `$` in page HTML literal. A string replacement
  // would treat `$&` inside highlighted code as the matched `<div id="root">`.
  const document = template
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace('<!--head-->', () => `${head}\n<script>window.__PAGE__=${payload}</script>`)
    .replace('<div id="root"></div>', () => `<div id="root">${html}</div>`)
  const dest = page.url === '/' ? join(root, 'dist', 'index.html') : join(root, 'dist', `${page.url.slice(1)}.html`)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, document)
  count++
}

const home = readFileSync(join(root, 'dist', 'index.html'), 'utf8')
for (const required of ['<title>', 'rel="canonical"', 'og:title', 'application/ld+json', 'Learn Java']) {
  if (!home.includes(required)) {
    console.error(`Homepage HTML is missing ${required}`)
    process.exit(1)
  }
}
console.log(`Prerendered ${count} pages`)
