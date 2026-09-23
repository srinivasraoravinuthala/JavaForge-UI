/**
 * Concept data model types for JavaForge-UI (Phase 13A/13B).
 *
 * Source of truth:
 * - Discovery inventory: docs/concepts.json (coverage, titles, slugs, origins)
 * - Build artifact: public/content/concepts.json (resolved resource refs)
 * - Routes: /concepts and /concepts/<slug> (page JSON + prerender; Phase 13B)
 *
 * No final concept UI (13C) and no search concept type.
 */

export type ConceptCoverage = 'A' | 'B' | 'C' | 'D' | 'E'

export type ConceptOrigin = 'lesson-title' | 'type-name-evidence'

export type ConceptRelationKind = 'explicit' | 'deterministic'

export interface ConceptRef {
  title: string
  url: string
  /** Present for code / leetcode when known. */
  file?: string
}

export interface ConceptRelation {
  /** Target concept id */
  id: string
  kind: ConceptRelationKind
  /** Short machine reason, not learner prose. */
  evidence: string
}

export interface ConceptRecord {
  id: string
  slug: string
  title: string
  coverage: ConceptCoverage
  origin: ConceptOrigin
  /** Alternate titles that normalize to this concept (e.g. String → Strings). */
  aliases: string[]
  lessons: ConceptRef[]
  examples: ConceptRef[]
  references: ConceptRef[]
  interviews: ConceptRef[]
  leetcode: ConceptRef[]
  projects: ConceptRef[]
  versions: ConceptRef[]
  related: ConceptRelation[]
  /** Package ids observed on strong example refs, when any. */
  packages: string[]
  /** Topic/stage labels observed on strong lesson/example refs, when any. */
  topics: string[]
}

export interface ConceptModel {
  version: 1
  generatedFrom: {
    discovery: 'docs/concepts.json'
    searchIndex: 'public/content/search-index.json'
  }
  /** First implementation slice: coverage A and B only. */
  slice: 'A+B'
  concepts: ConceptRecord[]
}

export const CONCEPT_SLICE_COVERAGES: ConceptCoverage[] = ['A', 'B']

export function isConceptCoverage(value: unknown): value is ConceptCoverage {
  return value === 'A' || value === 'B' || value === 'C' || value === 'D' || value === 'E'
}

export function isConceptRelationKind(value: unknown): value is ConceptRelationKind {
  return value === 'explicit' || value === 'deterministic'
}

/** Slug rule for concept ids derived from discovery. */
export function isValidConceptSlug(slug: string): boolean {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug)
}

export function conceptIdFromSlug(slug: string): string {
  return `concept:${slug}`
}

export class ConceptValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConceptValidationError'
  }
}

function assertRefList(label: string, conceptId: string, list: unknown): ConceptRef[] {
  if (!Array.isArray(list)) throw new ConceptValidationError(`${conceptId}: ${label} must be an array`)
  const seen = new Set<string>()
  const out: ConceptRef[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') throw new ConceptValidationError(`${conceptId}: invalid ${label} entry`)
    const row = item as ConceptRef
    if (typeof row.title !== 'string' || !row.title.trim()) {
      throw new ConceptValidationError(`${conceptId}: ${label} entry missing title`)
    }
    if (typeof row.url !== 'string' || !row.url.startsWith('/')) {
      throw new ConceptValidationError(`${conceptId}: ${label} entry has invalid url`)
    }
    if (row.file != null && typeof row.file !== 'string') {
      throw new ConceptValidationError(`${conceptId}: ${label} entry has invalid file`)
    }
    const key = `${row.url}\0${row.file || ''}`
    if (seen.has(key)) throw new ConceptValidationError(`${conceptId}: duplicate ${label} ${row.url}`)
    seen.add(key)
    out.push(row.file ? { title: row.title, url: row.url, file: row.file } : { title: row.title, url: row.url })
  }
  return out
}

export function validateConceptModel(
  model: unknown,
  options: { knownUrls?: Set<string>; requireSliceOnly?: boolean } = {},
): ConceptModel {
  if (!model || typeof model !== 'object') throw new ConceptValidationError('concept model must be an object')
  const root = model as ConceptModel
  if (root.version !== 1) throw new ConceptValidationError('concept model version must be 1')
  if (root.slice !== 'A+B') throw new ConceptValidationError('concept model slice must be A+B')
  if (!Array.isArray(root.concepts)) throw new ConceptValidationError('concepts must be an array')
  if (root.concepts.length === 0) throw new ConceptValidationError('concepts must not be empty')

  const ids = new Set<string>()
  const slugs = new Set<string>()
  const byId = new Map<string, ConceptRecord>()

  for (const raw of root.concepts) {
    if (!raw || typeof raw !== 'object') throw new ConceptValidationError('invalid concept record')
    const concept = raw as ConceptRecord
    if (typeof concept.id !== 'string' || !concept.id.startsWith('concept:')) {
      throw new ConceptValidationError(`invalid concept id ${String(concept.id)}`)
    }
    if (typeof concept.slug !== 'string' || !isValidConceptSlug(concept.slug)) {
      throw new ConceptValidationError(`invalid concept slug ${String(concept.slug)}`)
    }
    if (concept.id !== conceptIdFromSlug(concept.slug)) {
      throw new ConceptValidationError(`${concept.id}: id must be concept:<slug>`)
    }
    if (ids.has(concept.id)) throw new ConceptValidationError(`duplicate concept id ${concept.id}`)
    if (slugs.has(concept.slug)) throw new ConceptValidationError(`duplicate concept slug ${concept.slug}`)
    ids.add(concept.id)
    slugs.add(concept.slug)

    if (typeof concept.title !== 'string' || !concept.title.trim()) {
      throw new ConceptValidationError(`${concept.id}: missing title`)
    }
    if (!isConceptCoverage(concept.coverage)) {
      throw new ConceptValidationError(`${concept.id}: invalid coverage`)
    }
    if (options.requireSliceOnly !== false && !CONCEPT_SLICE_COVERAGES.includes(concept.coverage)) {
      throw new ConceptValidationError(`${concept.id}: coverage ${concept.coverage} outside A+B slice`)
    }
    if (concept.origin !== 'lesson-title' && concept.origin !== 'type-name-evidence') {
      throw new ConceptValidationError(`${concept.id}: invalid origin`)
    }
    if (!Array.isArray(concept.aliases) || concept.aliases.some((alias) => typeof alias !== 'string')) {
      throw new ConceptValidationError(`${concept.id}: aliases must be a string array`)
    }

    const lessons = assertRefList('lessons', concept.id, concept.lessons)
    const examples = assertRefList('examples', concept.id, concept.examples)
    const references = assertRefList('references', concept.id, concept.references)
    const interviews = assertRefList('interviews', concept.id, concept.interviews)
    const leetcode = assertRefList('leetcode', concept.id, concept.leetcode)
    const projects = assertRefList('projects', concept.id, concept.projects)
    const versions = assertRefList('versions', concept.id, concept.versions)

    const resourceCount = lessons.length + examples.length + references.length
      + interviews.length + leetcode.length + projects.length + versions.length
    if (resourceCount === 0) throw new ConceptValidationError(`${concept.id}: concept has no resources`)

    if (!Array.isArray(concept.related)) throw new ConceptValidationError(`${concept.id}: related must be an array`)
    for (const rel of concept.related) {
      if (!rel || typeof rel !== 'object') throw new ConceptValidationError(`${concept.id}: invalid related entry`)
      if (typeof rel.id !== 'string' || !rel.id.startsWith('concept:')) {
        throw new ConceptValidationError(`${concept.id}: related id invalid`)
      }
      if (!isConceptRelationKind(rel.kind)) {
        throw new ConceptValidationError(`${concept.id}: related kind invalid`)
      }
      if (typeof rel.evidence !== 'string' || !rel.evidence.trim()) {
        throw new ConceptValidationError(`${concept.id}: related evidence required`)
      }
      if (rel.id === concept.id) throw new ConceptValidationError(`${concept.id}: related cannot point to self`)
    }

    if (!Array.isArray(concept.packages) || concept.packages.some((pkg) => typeof pkg !== 'string')) {
      throw new ConceptValidationError(`${concept.id}: packages must be a string array`)
    }
    if (!Array.isArray(concept.topics) || concept.topics.some((topic) => typeof topic !== 'string')) {
      throw new ConceptValidationError(`${concept.id}: topics must be a string array`)
    }

    const normalized: ConceptRecord = {
      ...concept,
      lessons,
      examples,
      references,
      interviews,
      leetcode,
      projects,
      versions,
    }

    if (options.knownUrls) {
      for (const group of [lessons, examples, references, interviews, leetcode, projects, versions]) {
        for (const ref of group) {
          const base = ref.url.split('#')[0]
          if (!options.knownUrls.has(base) && !options.knownUrls.has(ref.url)) {
            throw new ConceptValidationError(`${concept.id}: unknown resource url ${ref.url}`)
          }
        }
      }
    }

    byId.set(concept.id, normalized)
  }

  for (const concept of byId.values()) {
    for (const rel of concept.related) {
      if (!byId.has(rel.id)) {
        throw new ConceptValidationError(`${concept.id}: related target missing ${rel.id}`)
      }
    }
  }

  return {
    version: 1,
    generatedFrom: root.generatedFrom,
    slice: 'A+B',
    concepts: [...byId.values()],
  }
}
