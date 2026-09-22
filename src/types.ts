export interface Crumb {
  name: string
  href: string
}

export interface NavLink {
  href: string
  title: string
}

export interface LeetCodeMeta {
  plan: string
  planId: string
  problemNumber: string | null
  title: string | null
  difficulty: string | null
  grouping: { label: string; name: string } | null
  helper: boolean
  approach?: string | null
  complexity?: string | null
  description?: string | null
  declaredPackage?: string | null
  previous?: NavLink | null
  next?: NavLink | null
}

export interface ExampleMeta {
  path: string
  pkg: string
  className: string
  role: string
  studyOrder: number
  runMode: string
  runCommand: string | null
  javaVersion: string | null
  requiredJava?: number
  exampleType?: string
  dependencies: string[]
  linkedLesson: string | null
  url: string | null
  leetcode?: LeetCodeMeta
}

export interface Stage {
  id: string
  label: string
  href: string
  title: string
  chapterHrefs: string[]
  chapters?: { number: number; title: string; href: string; description: string }[]
}

export interface PageData {
  kind: string
  url: string
  title: string
  description: string
  canonicalPath: string
  robots: string
  breadcrumbs?: Crumb[]
  jsonLd?: unknown
  home?: {
    counts: { lessons: number; javaFiles: number; packages: number; interviewTopics: number }
    start: NavLink | null
    stages: Stage[]
    versions: { label: string; href: string | null }[]
    samples: { className: string; path: string; href: string; role: string }[]
    plans: { label: string; count: number; href: string }[]
    interview: { href: string; topics: number }
    projects: { title: string }[]
  }
  learn?: { stages: Stage[] }
  doc?: {
    section: string
    sectionLabel: string
    stageLabel: string | null
    html: string
    headings: { id: string; text: string; level: number }[]
    outline?: { id: string; text: string; kind: 'question' | 'section' }[]
    previous: NavLink | null
    next: NavLink | null
    related: ExampleMeta[]
    connected?: {
      interview: NavLink[]
      reference: NavLink[]
      projects: NavLink[]
    }
    trackPlace: boolean
  }
  packages?: { pkg: string; role: string; count: number; url: string }[]
  package?: { pkg: string; role: string; count: number; url: string; examples: ExampleMeta[]; chapter: NavLink | null }
  example?: ExampleMeta & { modeLabel: string; html: string; source: string }
  projects?: { dir: string; title: string; description: string; href: string; lesson: NavLink | null }[]
  java25?: {
    ga: string
    spec: string
    features: {
      jep: number
      title: string
      status: 'Final' | 'Preview' | 'Incubator' | 'Experimental'
      category: string
      summary: string
      history: string | null
      jepUrl: string
      lesson?: NavLink | null
      example?: NavLink | null
    }[]
    versions: { label: string; href: string | null }[]
  }
  catalog?: {
    version: number
    href: string
    ga: string
    spec: string
    lts: boolean
    overview: string
  }[]
  release?: {
    version: number
    ga: string
    spec: string
    lts: boolean
    overview: string
    sources: string
    projectUrl: string
    also: string | null
    historical: string | null
    features: {
      id: string
      name: string
      status: 'Final' | 'Preview' | 'Incubator' | 'Experimental'
      category: string
      summary: string
      history: string | null
      jep: number | null
      jepUrl: string | null
      lesson?: NavLink | null
      example?: NavLink | null
    }[]
    examples: { href: string; title: string; note: string; exampleType: string; requiredJava: number }[]
    previous: NavLink | null
    next: NavLink | null
  }
}

export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || 'https://javamastery.srinivasrao.co.in').replace(/\/$/, '')

export function pageRequest(pathname: string): string {
  if (pathname === '/') return '/content/pages/home.json'
  return `/content/pages${pathname}.json`
}

export function notFound(pathname: string): PageData {
  return {
    kind: 'notfound',
    url: pathname,
    title: 'Page not found — JavaMastery',
    description: 'That page is not in the JavaMastery library.',
    canonicalPath: pathname,
    robots: 'noindex,follow',
  }
}
