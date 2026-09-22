export interface SearchDocument {
  id: string
  type: 'lesson' | 'example' | 'interview' | 'leetcode' | 'project' | 'reference' | 'version'
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

export function normalize(value: string): string {
  const spaced = value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  return spaced.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

interface Norm {
  title: string
  titleFlat: string
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

function includesBounded(haystack: string, needle: string): boolean {
  if (!needle || !haystack.includes(needle)) return false
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

function covers(text: string, squeezed: string, phrase: string, phraseFlat: string, tokens: string[]): 'exact' | 'phrase' | 'tokens' | '' {
  if (!text) return ''
  if (text === phrase) return 'exact'
  if (includesBounded(text, phrase) || (phraseFlat.length > 1 && includesBounded(squeezed, phraseFlat))) return 'phrase'
  if (tokens.length > 0 && tokens.every((token) => includesBounded(squeezed, token))) return 'tokens'
  return ''
}

function scoreDocument(norm: Norm, phrase: string, phraseFlat: string, tokens: string[]): number {
  let score = 0
  const titleHit = covers(norm.title, norm.titleFlat, phrase, phraseFlat, tokens)
  const fileHit = covers(norm.file, norm.fileFlat, phrase, phraseFlat, tokens)
  const topicHit = covers(norm.topic, norm.topicFlat, phrase, phraseFlat, tokens)
  const headingHit = covers(norm.headings, norm.headingsFlat, phrase, phraseFlat, tokens)
  const descriptionHit = covers(norm.description, norm.descriptionFlat, phrase, phraseFlat, tokens)
  const keywordHit = covers(norm.keywords, norm.keywordsFlat, phrase, phraseFlat, tokens)
  if (titleHit === 'exact') score += 1000
  else if (titleHit === 'phrase') score += 720
  else if (titleHit === 'tokens') score += 520
  if (fileHit === 'exact') score += 680
  else if (fileHit === 'phrase') score += 600
  else if (fileHit === 'tokens') score += 460
  if (topicHit === 'exact') score += 440
  else if (topicHit === 'phrase') score += 360
  else if (topicHit === 'tokens') score += 240
  if (headingHit === 'phrase') score += 280
  else if (headingHit === 'tokens') score += 180
  if (descriptionHit === 'phrase') score += 160
  else if (descriptionHit === 'tokens') score += 70
  if (keywordHit === 'phrase') score += 140
  else if (keywordHit === 'tokens') score += 50
  const primary = `${norm.title} ${norm.file} ${norm.topic} ${norm.headings}`
  if (tokens.length > 1 && tokens.every((token) => includesBounded(primary, token))) score += 220
  if (score > 0 && norm.anchor) score += 30
  return score
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
  const scored: { doc: SearchDocument; score: number }[] = []
  for (let i = 0; i < documents.length; i++) {
    const score = scoreDocument(norms[i], phrase, phraseFlat, tokens)
    if (score > 0) scored.push({ doc: documents[i], score })
  }
  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title) || a.doc.id.localeCompare(b.doc.id))
  return scored.slice(0, limit).map((row) => row.doc)
}
