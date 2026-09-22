import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const UI_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const EXPECTED = resolve(UI_ROOT, '..', 'JavaForge')
const DEFAULT_REPO = 'https://github.com/srinivasraoravinuthala/JavaForge.git'
const DEFAULT_REF = 'bddc5ccbd1dbef9aaa9b4b860aca916ac7c98774'

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
}

function assertRef(value) {
  if (!/^[A-Za-z0-9._/-]+$/.test(value) || value.startsWith('-') || value.includes('..')) {
    fail('JAVAFORGE_REF must be a commit, tag, or branch name.')
  }
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, stdio: 'inherit' })
  if (result.error) return result.error
  if (result.status !== 0) return new Error(`git ${args[0]} exited ${result.status}`)
  return null
}

function removeCheckout() {
  try {
    rmSync(EXPECTED, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 })
  } catch (error) {
    console.error(`Could not remove the incomplete checkout at ${EXPECTED}.`)
    console.error(error.message)
  }
}

if (existsSync(join(EXPECTED, 'docs'))) {
  console.log(`Using local JavaForge at ${EXPECTED}`)
  process.exit(0)
}

assertPublicRepo(repo)
assertRef(ref)

if (existsSync(EXPECTED)) {
  fail(`A directory already exists at ${EXPECTED} but it has no docs/. Remove it or point the build at a complete JavaForge checkout.`)
}

console.log(`Fetching JavaForge ${ref} into ${EXPECTED}`)
let error = git(['clone', repo, EXPECTED], dirname(EXPECTED))
if (error) {
  removeCheckout()
  if (error.code === 'ENOENT') fail('git is not available on PATH.')
  fail('git clone failed. The repository could not be reached.')
}
error = git(['checkout', '--detach', ref], EXPECTED)
if (error) {
  removeCheckout()
  fail('git checkout failed. The revision may not exist in the cloned repository.')
}
if (/^[0-9a-f]{40}$/i.test(ref)) {
  const parsed = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: EXPECTED, encoding: 'utf8' })
  const head = (parsed.stdout || '').trim()
  if (parsed.status !== 0 || head.toLowerCase() !== ref.toLowerCase()) {
    removeCheckout()
    fail(`The checkout is ${head || 'unknown'}, which is not the requested revision.`)
  }
}

if (!existsSync(join(EXPECTED, 'docs'))) {
  removeCheckout()
  fail('The fetched revision does not contain docs/.')
}

console.log(`Fetched JavaForge ${ref}`)
