import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const UI_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const EXPECTED = resolve(UI_ROOT, '..', 'JavaForge')
const DEFAULT_REPO = 'https://github.com/srinivasraoravinuthala/JavaForge.git'
const DEFAULT_REF = 'bddc5ccbd1dbef9aaa9b4b860aca916ac7c98774'
const ARCHIVE_HOSTS = new Set(['github.com', 'codeload.github.com'])

const repo = process.env.JAVAFORGE_REPO || DEFAULT_REPO
const ref = process.env.JAVAFORGE_REF || DEFAULT_REF

function fail(detail) {
  console.error('JavaForge could not be obtained.')
  console.error(`Requested revision: ${ref}`)
  console.error(`Expected location: ${EXPECTED}`)
  console.error(`Repository: ${repo}`)
  console.error(detail)
  console.error('Check JAVAFORGE_REF and JAVAFORGE_REPO. The checkout must contain docs/ before the content build starts.')
  process.exit(1)
}

function assertPublicRepo(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    fail('JAVAFORGE_REPO is not a valid URL.')
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
    fail('JAVAFORGE_REPO must be an https URL without credentials.')
  }
  return parsed
}

function assertRef(value) {
  if (!/^[A-Za-z0-9._/-]+$/.test(value) || value.startsWith('-') || value.includes('..')) {
    fail('JAVAFORGE_REF must be a commit, tag, or branch name.')
  }
}

function githubArchive(repoUrl, revision) {
  const parsed = assertPublicRepo(repoUrl)
  if (parsed.hostname !== 'github.com') {
    fail('JAVAFORGE_REPO must be a github.com repository. Only GitHub commit archives are supported.')
  }
  const parts = parsed.pathname.replace(/\.git$/i, '').split('/').filter(Boolean)
  if (parts.length !== 2 || !/^[\w.-]+$/.test(parts[0]) || !/^[\w.-]+$/.test(parts[1])) {
    fail('JAVAFORGE_REPO must be https://github.com/<owner>/<repository>.')
  }
  const [owner, name] = parts
  return {
    name,
    root: `${name}-${revision}`,
    url: `https://github.com/${owner}/${name}/archive/${encodeURIComponent(revision)}.tar.gz`,
  }
}

function removeCheckout() {
  try {
    rmSync(EXPECTED, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 })
  } catch (error) {
    console.error(`Could not remove the incomplete checkout at ${EXPECTED}.`)
    console.error(error.message)
  }
}

function removeArchive(path) {
  try {
    rmSync(path, { force: true, maxRetries: 5, retryDelay: 100 })
  } catch {
    // The extracted tree is the build input. A leftover temp archive is not.
  }
}

async function download(url, dest) {
  let current = url
  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetch(current, { redirect: 'manual' })
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) fail(`The archive redirect from ${current} had no location.`)
      const next = new URL(location, current)
      if (next.protocol !== 'https:' || next.username || next.password || !ARCHIVE_HOSTS.has(next.hostname)) {
        fail(`Refusing archive redirect to ${next.href}.`)
      }
      current = next.href
      continue
    }
    if (!response.ok) {
      fail(`The archive download failed with HTTP ${response.status} for ${url}.`)
    }
    writeFileSync(dest, Buffer.from(await response.arrayBuffer()))
    return
  }
  fail(`Too many redirects while downloading ${url}.`)
}

function tar(args) {
  const result = spawnSync('tar', args, { encoding: 'utf8' })
  if (result.error) return { error: result.error, status: result.status, stdout: '', stderr: '' }
  return { error: null, status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' }
}

function archiveRoots(listing) {
  const roots = new Set()
  for (const line of listing.split(/\r?\n/)) {
    const entry = line.trim().replace(/^\.\//, '')
    if (!entry) continue
    roots.add(entry.split('/')[0])
  }
  return roots
}

if (existsSync(join(EXPECTED, 'docs'))) {
  console.log(`Using local JavaForge at ${EXPECTED}`)
  process.exit(0)
}

assertRef(ref)
const archive = githubArchive(repo, ref)

if (existsSync(EXPECTED)) {
  fail(`A directory already exists at ${EXPECTED} but it has no docs/. Remove it or point the build at a complete JavaForge checkout.`)
}

console.log('JavaForge not found locally')
console.log(`Downloading JavaForge ${ref} archive`)
const archivePath = join(tmpdir(), `javaforge-${process.pid}.tar.gz`)
try {
  await download(archive.url, archivePath)
  const listed = tar(['-tzf', archivePath])
  if (listed.error?.code === 'ENOENT') fail('tar is not available on PATH, so the JavaForge archive could not be extracted.')
  if (listed.status !== 0) fail(`The downloaded file is not a readable tar archive. ${listed.stderr}`.trim())
  const roots = archiveRoots(listed.stdout)
  if (/^[0-9a-f]{40}$/i.test(ref)) {
    if (roots.size !== 1 || !roots.has(archive.root)) {
      fail(`The archive root was ${[...roots].join(', ') || 'empty'}, which does not match the requested revision ${ref}.`)
    }
  } else if (roots.size !== 1) {
    fail(`The archive did not contain a single top-level directory (${[...roots].join(', ') || 'empty'}).`)
  }

  console.log('Extracting...')
  mkdirSync(EXPECTED, { recursive: true })
  const extracted = tar(['-xzf', archivePath, '-C', EXPECTED, '--strip-components=1'])
  if (extracted.status !== 0) {
    removeCheckout()
    fail(`Extracting the JavaForge archive failed. ${extracted.stderr}`.trim())
  }
} catch (error) {
  removeCheckout()
  if (error?.code === 'EEXIT') throw error
  fail(error?.message || 'The JavaForge archive could not be downloaded.')
} finally {
  removeArchive(archivePath)
}

if (!existsSync(join(EXPECTED, 'docs'))) {
  removeCheckout()
  fail('The downloaded revision does not contain docs/.')
}

console.log(`Fetched JavaForge ${ref}`)
