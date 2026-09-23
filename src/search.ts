export interface SearchDocument {
  id: string
  type: 'lesson' | 'example' | 'interview' | 'leetcode' | 'project' | 'reference' | 'version' | 'concept'
  title: string
  url: string
  description?: string
  hint?: string
  file?: string
  topic?: string
  pkg?: string
  headings?: string
  keywords?: string[]
}

export const SEARCH_TYPE_LABEL: Record<SearchDocument['type'], string> = {
  concept: 'Concept',
  example: 'Code',
  lesson: 'Lesson',
  reference: 'Reference',
  leetcode: 'LeetCode',
  interview: 'Interview',
  project: 'Project',
  version: 'Version',
}

/** Soft preference only. Must stay well below a title exact/phrase gap. */
const TYPE_BOOST: Record<SearchDocument['type'], number> = {
  concept: 220,
  example: 90,
  lesson: 85,
  reference: 50,
  project: 40,
  leetcode: 25,
  version: 20,
  interview: 15,
}

export function normalize(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  return spaced.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

interface Norm {
  title: string
  titleFlat: string
  titleTokens: string[]
  file: string
  fileFlat: string
  topic: string
  topicFlat: string
  headings: string
  headingsFlat: string
  description: string
  descriptionFlat: string
  keywords: string
  keywordsFlat: string
  anchor: boolean
  pkg: string
  type: SearchDocument['type']
  rapid: boolean
}

const normCache = new WeakMap<SearchDocument[], Norm[]>()

function flat(value: string): string {
  return value.replace(/ /g, '')
}

function toNorm(doc: SearchDocument): Norm {
  const title = normalize(doc.title)
  const file = normalize(doc.file || '')
  const topic = normalize(`${doc.topic || ''} ${doc.pkg || ''}`)
  const headings = normalize(doc.headings || '')
  const description = normalize(doc.description || '')
  const keywords = normalize((doc.keywords || []).join(' '))
  return {
    title,
    titleFlat: flat(title),
    titleTokens: title.split(' ').filter(Boolean),
    file,
    fileFlat: flat(file),
    topic,
    topicFlat: flat(topic),
    headings,
    headingsFlat: flat(headings),
    description,
    descriptionFlat: flat(description),
    keywords,
    keywordsFlat: flat(keywords),
    anchor: doc.url.includes('#'),
    pkg: doc.pkg || '',
    type: doc.type,
    rapid: doc.id.includes(':rapid:'),
  }
}

function normsFor(documents: SearchDocument[]): Norm[] {
  let norms = normCache.get(documents)
  if (!norms) {
    norms = documents.map(toNorm)
    normCache.set(documents, norms)
  }
  return norms
}

function tokenEquals(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length < 2 || b.length < 2) return false
  if (a === `${b}s` || b === `${a}s`) return true
  if (a === `${b}es` || b === `${a}es`) return true
  return false
}

/** Whole-token / whole-phrase match on spaced text. Avoids "string" inside "substring". */
function includesPhrase(haystack: string, phrase: string): boolean {
  if (!haystack || !phrase) return false
  if (haystack === phrase) return true
  const hay = haystack.split(' ').filter(Boolean)
  const needle = phrase.split(' ').filter(Boolean)
  if (!needle.length || hay.length < needle.length) return false
  for (let i = 0; i <= hay.length - needle.length; i += 1) {
    let ok = true
    for (let j = 0; j < needle.length; j += 1) {
      if (!tokenEquals(hay[i + j], needle[j])) {
        ok = false
        break
      }
    }
    if (ok) return true
  }
  return false
}

/** Identifier match on squeezed text with digit-aware boundaries. */
function includesIdentifier(haystack: string, needle: string): boolean {
  if (!needle || needle.length < 4 || !haystack.includes(needle)) return false
  if (!/\d/.test(needle)) return true
  let from = 0
  while (from < haystack.length) {
    const at = haystack.indexOf(needle, from)
    if (at < 0) return false
    const before = at === 0 ? '' : haystack[at - 1]
    const after = haystack[at + needle.length] || ''
    if (!/\d/.test(before) && !/\d/.test(after)) return true
    from = at + 1
  }
  return false
}

type Hit = 'exact' | 'starts' | 'phrase' | 'tokens' | ''

function covers(text: string, squeezed: string, phrase: string, phraseFlat: string, tokens: string[]): Hit {
  if (!text) return ''
  if (text === phrase) return 'exact'
  if (text.startsWith(`${phrase} `) || text === phrase) return text === phrase ? 'exact' : 'starts'
  if (text.startsWith(phrase) && text.length > phrase.length && !/[a-z0-9]/.test(text[phrase.length])) return 'starts'
  if (includesPhrase(text, phrase)) return 'phrase'
  if (phraseFlat.length > 3 && includesIdentifier(squeezed, phraseFlat)) return 'phrase'
  if (tokens.length > 0 && tokens.every((token) => includesPhrase(text, token) || (token.length > 3 && includesIdentifier(squeezed, token)))) {
    return 'tokens'
  }
  return ''
}

function hitScore(hit: Hit, exact: number, starts: number, phrase: number, tokens: number): number {
  if (hit === 'exact') return exact
  if (hit === 'starts') return starts
  if (hit === 'phrase') return phrase
  if (hit === 'tokens') return tokens
  return 0
}

function packageBoost(norm: Norm): number {
  if (norm.type !== 'example') return 0
  const pkg = norm.pkg
  if (!pkg) return 8
  if (/adv/i.test(pkg)) return -20
  if (pkg === 'pkg0intro' || pkg === 'pkg1core') return 55
  if (pkg === 'pkg7concurrency' || pkg === 'pkg3datastructures' || pkg === 'pkg4algorithms') return 28
  if (pkg === 'pkg12restapi' || pkg === 'pkg11jdbc' || pkg === 'pkg10networking') return 22
  if (pkg === 'pkg19performance') return 0
  return 12
}

function scoreDocument(norm: Norm, phrase: string, phraseFlat: string, tokens: string[]): number {
  let score = 0
  const titleHit = covers(norm.title, norm.titleFlat, phrase, phraseFlat, tokens)
  const fileHit = covers(norm.file, norm.fileFlat, phrase, phraseFlat, tokens)
  const topicHit = covers(norm.topic, norm.topicFlat, phrase, phraseFlat, tokens)
  const headingHit = covers(norm.headings, norm.headingsFlat, phrase, phraseFlat, tokens)
  const descriptionHit = covers(norm.description, norm.descriptionFlat, phrase, phraseFlat, tokens)
  const keywordHit = covers(norm.keywords, norm.keywordsFlat, phrase, phraseFlat, tokens)
  const titleTokens = norm.titleTokens.length
  const titleParts = norm.titleTokens

  score += hitScore(titleHit, 1000, 900, 780, 540)

  // CamelCase queries like HashMap become "hash map". Prefer the bare type over ConcurrentHashMap.
  if (titleHit && phrase.includes(' ') && phraseFlat.length >= 6) {
    if (
      norm.titleFlat === phraseFlat
      || norm.titleFlat.startsWith(phraseFlat)
      || norm.titleFlat.includes(`howdoes${phraseFlat}`)
      || norm.titleFlat.includes(`whatis${phraseFlat}`)
    ) {
      score += 120
    }
    const hay = titleParts
    const needle = phrase.split(' ').filter(Boolean)
    for (let i = 0; i <= hay.length - needle.length; i += 1) {
      if (needle.every((part, j) => tokenEquals(hay[i + j], part)) && i > 0) {
        if (/^(concurrent|linked|identity|weak|enum|copyonwrite|tree|write)/.test(hay[i - 1])) {
          score -= 160
          break
        }
      }
    }
    if (/copyonwrite|concurrent|linkedhash|identityhash/.test(norm.titleFlat) && norm.titleFlat.includes(phraseFlat) && !norm.titleFlat.startsWith(phraseFlat)) {
      score -= 120
    }
  }

  // File confirms identity; keep below title so problem filenames cannot bury concept pages.
  if (fileHit === 'exact') score += titleHit ? 220 : 680
  else if (fileHit === 'starts') score += titleHit ? 160 : 520
  else if (fileHit === 'phrase') score += titleHit ? 120 : 420
  else if (fileHit === 'tokens') score += titleHit ? 80 : 300

  // Topic/parent-page labels often repeat the query for every child row — dampen when title already matched.
  const topicPoints = hitScore(topicHit, 400, 340, 300, 200)
  score += titleHit ? Math.floor(topicPoints * 0.2) : topicPoints
  const headingPoints = hitScore(headingHit, 0, 0, 260, 170)
  score += titleHit ? Math.floor(headingPoints * 0.35) : headingPoints
  score += hitScore(descriptionHit, 0, 0, 140, 60)
  score += hitScore(keywordHit, 0, 0, 120, 45)

  if (tokens.length > 1) {
    const primary = `${norm.title} ${norm.file} ${norm.topic} ${norm.headings}`
    if (tokens.every((token) => includesPhrase(primary, token) || (token.length > 3 && includesIdentifier(flat(primary), token)))) {
      score += 200
    }
  }

  // Concept-shaped titles: short lesson/reference titles that are the query itself.
  if (
    (titleHit === 'exact' || titleHit === 'phrase')
    && titleTokens <= 2
    && (norm.type === 'lesson' || norm.type === 'reference')
  ) {
    score += 180
  }

  // Exact concept titles are the navigation entry for a topic.
  if (norm.type === 'concept' && titleHit) {
    if (titleHit === 'exact') score += 420
    else if (titleHit === 'starts') score += 280
    else if (titleHit === 'phrase') score += 200
    else score += 80
  }

  // Prefer fuller interview questions over short head-token matches ("HashMap null keys?").
  if (norm.type === 'interview' && titleHit) {
    const explanatory = /^(how |what |why |when |is |does |can |should )/.test(norm.title)
    if (titleHit === 'starts' && !explanatory && titleTokens <= 6) score -= 140
    if (titleTokens >= 5 && includesPhrase(norm.title, phrase)) score += 90
    if (explanatory && includesPhrase(norm.title, phrase)) score += 130
    if (tokens.length === 1 && norm.title.includes(' vs ')) score -= 70
  }

  if (score > 0 && norm.anchor) score += 25
  if (score > 0 && norm.rapid) score -= 35

  if (score > 0) {
    score += TYPE_BOOST[norm.type] || 0
    score += packageBoost(norm)
  }
  return score
}

/**
 * Meta line for result rows: topic, package, and file when present.
 * Falls back to the prebuilt hint. Does not invent copy.
 * Concept rows put the inventory line in description only.
 */
export function searchResultMeta(doc: SearchDocument): string {
  if (doc.type === 'concept') return ''
  const parts: string[] = []
  if (doc.topic) parts.push(doc.topic)
  if (doc.pkg && !parts.some((part) => part.includes(doc.pkg!))) parts.push(doc.pkg)
  if (doc.file && !parts.some((part) => part.includes(doc.file!))) parts.push(doc.file)
  if (parts.length) return parts.join(' · ')
  return doc.hint || ''
}

export function searchDocuments(documents: SearchDocument[], query: string, limit = 12): SearchDocument[] {
  const phrase = normalize(query)
  const phraseFlat = phrase.replace(/ /g, '')
  if (phraseFlat.length < 2) return []
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((token) => normalize(token).replace(/ /g, ''))
    .filter((token) => token.length > 1)
  const norms = normsFor(documents)
  const scored: { doc: SearchDocument; score: number; url: string; rapid: boolean }[] = []
  for (let i = 0; i < documents.length; i++) {
    const score = scoreDocument(norms[i], phrase, phraseFlat, tokens)
    if (score > 0) {
      scored.push({ doc: documents[i], score, url: documents[i].url, rapid: norms[i].rapid })
    }
  }
  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title) || a.doc.id.localeCompare(b.doc.id))

  // Drop weaker rapid-fire rows that only point at the same unscoped page URL.
  const seenRapidUrls = new Set<string>()
  const deduped: typeof scored = []
  for (const row of scored) {
    if (row.rapid && !row.url.includes('#')) {
      if (seenRapidUrls.has(row.url)) continue
      seenRapidUrls.add(row.url)
    }
    deduped.push(row)
  }

  return deduped.slice(0, limit).map((row) => row.doc)
}
