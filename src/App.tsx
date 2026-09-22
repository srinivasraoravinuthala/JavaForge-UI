import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Breadcrumbs } from './components/Breadcrumbs'
import { CodePanel } from './components/CodePanel'
import { PathList } from './components/PathList'
import { SearchDialog } from './components/SearchDialog'
import { MobileNav, SiteFooter, SiteHeader } from './components/SiteChrome'
import { applyHead } from './seo'
import { readBookmarks, saveTheme, writeBookmarks, writePlace, type Bookmark } from './storage'
import { notFound, pageRequest, type PageData } from './types'

export function App({ initial }: { initial: PageData | null }) {
  const location = useLocation()
  const [page, setPage] = useState<PageData | null>(
    initial && initial.url === location.pathname ? initial : null,
  )
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchUsed, setSearchUsed] = useState(false)

  useEffect(() => {
    if (page?.url === location.pathname) return
    let cancel = false
    fetch(pageRequest(location.pathname))
      .then(async (res) => (res.ok ? ((await res.json()) as PageData) : notFound(location.pathname)))
      .then((data) => {
        if (!cancel) setPage(data)
      })
      .catch(() => {
        if (!cancel) setPage(notFound(location.pathname))
      })
    return () => {
      cancel = true
    }
  }, [location.pathname, page?.url])

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    if (page && page.url === location.pathname) applyHead(page)
  }, [page, location.pathname])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const button = (event.target as HTMLElement).closest('[data-copy-code]')
      if (!(button instanceof HTMLButtonElement)) return
      const lines = button.closest('.code-panel')?.querySelectorAll('.code-text')
      if (!lines?.length) return
      const text = [...lines].map((line) => line.textContent ?? '').join('\n')
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Copied'
        window.setTimeout(() => {
          button.textContent = 'Copy'
        }, 2000)
      }).catch(() => {
        button.textContent = 'Copy unavailable'
      })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchUsed(true)
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const current = page && page.url === location.pathname ? page : null

  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <SiteHeader
        theme={theme}
        onTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark'
          setTheme(next)
          saveTheme(next)
        }}
        onSearch={() => {
          setSearchUsed(true)
          setSearchOpen(true)
        }}
      />
      <main id="content" className="shell" tabIndex={-1}>
        {current ? <PageView page={current} /> : <p role="status">Loading.</p>}
      </main>
      <SiteFooter />
      <MobileNav />
      {searchUsed ? <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} /> : null}
    </>
  )
}

function PageView({ page }: { page: PageData }) {
  if (page.kind === 'home' && page.home) return <Home page={page} />
  if (page.kind === 'learn' && page.learn) return <Learn page={page} />
  if (page.kind === 'doc' && page.doc) return <Doc page={page} />
  if (page.kind === 'examples' && page.packages) return <Examples page={page} />
  if (page.kind === 'package' && page.package) return <PackagePage page={page} />
  if (page.kind === 'example' && page.example) return <ExamplePage page={page} />
  if (page.kind === 'projects' && page.projects) return <Projects page={page} />
  if (page.kind === 'bookmarks') return <Bookmarks />
  if (page.kind === 'versions' && page.catalog) return <VersionsPage page={page} />
  if ((page.kind === 'version' || page.kind === 'java25') && page.release) return <VersionPage page={page} />
  return (
    <>
      <h1 className="page-title">Page not found</h1>
      <p className="lede">That address is not in the library.</p>
      <Link to="/">Return home</Link>
    </>
  )
}

function Home({ page }: { page: PageData }) {
  const home = page.home!
  return (
    <>
      <p className="kicker">Java engineering, from the first program to the runtime</p>
      <h1 className="display">Learn Java. Think like an engineer.</h1>
      <p className="lede">
        Read the chapter, open the Java file it names, and run it. The path is {home.counts.lessons} chapters,
        {' '}{home.counts.javaFiles} Java files, and {home.counts.interviewTopics} interview topics.
      </p>
      <p className="actions">
        {home.start ? <Link className="text-button solid" to={home.start.href}>Start learning</Link> : null}
        <Link className="text-button" to="/learn">Explore the curriculum</Link>
      </p>

      <section className="band" aria-labelledby="path-heading">
        <h2 id="path-heading">Learning path</h2>
        <p className="band-note">Study order. When you open a chapter, that stage is marked on this device.</p>
        <PathList stages={home.stages} />
      </section>

      <section className="band" aria-labelledby="code-heading">
        <h2 id="code-heading">Real source</h2>
        <ul className="plain">
          {home.samples.map((sample) => (
            <li key={sample.path}>
              <Link to={sample.href}>{sample.className}</Link>
              <span className="mono">{sample.path}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="band" aria-labelledby="versions-heading">
        <h2 id="versions-heading">Java versions</h2>
        <ol className="timeline">
          {home.versions.map((version) => (
            <li key={version.label}>
              {version.href ? <Link to={version.href}>{version.label}</Link> : <span>{version.label}</span>}
              {version.href ? null : <span className="band-note"> No chapter yet</span>}
            </li>
          ))}
        </ol>
        <p className="band-note">Each release from Java 6 through Java 25 has its own page. Java 5 stays in the <Link to="/docs/02-learn--21-JavaVersions">version chapter</Link>.</p>
      </section>

      <section className="band split">
        <div>
          <h2 id="practice-heading">LeetCode</h2>
          <ul className="plain">
            {home.plans.map((plan) => (
              <li key={plan.label}>
                <Link to={plan.href}>{plan.label}</Link>
                <span className="count">{plan.count} files</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 id="interview-heading">Interview</h2>
          <p className="band-note">{home.interview.topics} topic files, with short answers and longer explanations in the source.</p>
          <Link className="text-button" to={home.interview.href}>Open the interview index</Link>
        </div>
      </section>

      <section className="band" aria-labelledby="projects-heading">
        <h2 id="projects-heading">Projects</h2>
        <ul className="plain">
          {home.projects.map((project) => (
            <li key={project.title}><Link to="/projects">{project.title}</Link></li>
          ))}
        </ul>
      </section>
    </>
  )
}

function Learn({ page }: { page: PageData }) {
  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <h1 className="page-title">Learning path</h1>
      <p className="lede">
        Chapters stay in this order. A filename number is an address. When it disagrees with this path, the path wins.
      </p>
      <PathList stages={page.learn!.stages} />
      {page.learn!.stages.map((stage) => (
        <section key={stage.id} className="band" aria-labelledby={stage.id}>
          <h2 id={stage.id}>{stage.label}</h2>
          <ol className="catalog">
            {stage.chapters?.map((chapter) => (
              <li key={chapter.href}>
                <Link to={chapter.href}>
                  <span className="count">{String(chapter.number).padStart(2, '0')}</span>
                  <span>{chapter.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  )
}

function Doc({ page }: { page: PageData }) {
  const doc = page.doc!
  const location = useLocation()
  const questions = doc.outline?.filter((item) => item.kind === 'question') ?? []
  const [currentId, setCurrentId] = useState('')
  const drawerRef = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    if (doc.trackPlace) writePlace(page.url)
  }, [doc.trackPlace, page.url])

  useEffect(() => {
    const details = drawerRef.current
    if (!details) return
    const media = window.matchMedia('(min-width: 960px)')
    const sync = () => {
      details.open = media.matches
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [page.url, doc.outline])

  useEffect(() => {
    const id = hashId(location.hash)
    if (!id) return
    const target = document.getElementById(id)
    if (!(target instanceof HTMLElement)) return
    target.scrollIntoView({ block: 'start' })
    target.focus({ preventScroll: true })
  }, [location.hash, page.url])

  useEffect(() => {
    const items = doc.outline?.filter((item) => item.kind === 'question') ?? []
    if (!items.length) return
    const known = new Set(items.map((item) => item.id))
    const fromHash = hashId(location.hash)
    if (fromHash && known.has(fromHash)) setCurrentId(fromHash)
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
    let observer: IntersectionObserver | null = null
    try {
      observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const id = visible[0]?.target.id
        if (id && known.has(id)) setCurrentId(id)
      }, { rootMargin: '-72px 0px -55% 0px' })
      for (const node of nodes) observer.observe(node)
    } catch {
      observer = null
    }
    return () => observer?.disconnect()
  }, [doc.outline, location.hash, page.url])

  const currentIndex = questions.findIndex((item) => item.id === currentId)
  const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null
  const nextQuestion = currentIndex >= 0 && currentIndex < questions.length - 1
    ? questions[currentIndex + 1]
    : currentIndex < 0 && questions.length
      ? questions[0]
      : null

  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <div className={doc.outline?.length ? 'layout with-rail with-questions' : 'layout with-rail'}>
        {doc.outline?.length ? (
          <details className="question-drawer" id="questions" ref={drawerRef}>
            <summary>Questions ({questions.length})</summary>
            <nav aria-label="Questions">
              <ol>
                {doc.outline.map((item) => (
                  <li key={item.id} className={item.kind === 'section' ? 'section-link' : undefined}>
                    <a href={`#${item.id}`} aria-current={item.id === currentId ? 'location' : undefined}>{item.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </details>
        ) : null}
        <article className="doc">
          <p className="kicker">{doc.stageLabel || doc.sectionLabel}</p>
          {page.url === '/docs/02-learn--21-JavaVersions' || page.url === '/docs/04-reference--01-JavaVersions' ? (
            <p className="band-note"><Link to="/versions">Java 6 through Java 25</Link> each have a version page. This page still describes the earlier versions, including Java 21. <Link to="/versions/java-25">Java 25</Link> is a later release.</p>
          ) : null}
          <div dangerouslySetInnerHTML={{ __html: doc.html }} />
          <NamedSources title="Source named in this chapter" id="related-code" items={doc.related.filter((item) => item.pkg !== 'pkg5leetcode')} />
          <NamedSources title="LeetCode files named in this chapter" id="related-leetcode" items={doc.related.filter((item) => item.pkg === 'pkg5leetcode')} />
          <NamedPages
            title={doc.section === '03-interview' ? 'Topics named on this page' : 'Interview topics named in this chapter'}
            id="related-interview"
            items={doc.connected?.interview}
          />
          <NamedPages title="Reference pages named in this chapter" id="related-reference" items={doc.connected?.reference} />
          <NamedPages title="Projects named in this chapter" id="related-projects" items={doc.connected?.projects} />
          {questions.length > 0 ? (
            <>
            <p className="band-note"><a href="#questions">Question list</a></p>
            <div className="pager">
              {previousQuestion ? <a href={`#${previousQuestion.id}`}>Previous question<span>{previousQuestion.text}</span></a> : <span />}
              {nextQuestion ? <a href={`#${nextQuestion.id}`}>{currentIndex < 0 ? 'First question' : 'Next question'}<span>{nextQuestion.text}</span></a> : <span />}
            </div>
            </>
          ) : null}
          <BookmarkControl url={page.url} title={page.title} />
          <div className="pager">
            {doc.previous ? <Link to={doc.previous.href}>Previous<span>{doc.previous.title}</span></Link> : <span />}
            {doc.next ? <Link to={doc.next.href}>Next<span>{doc.next.title}</span></Link> : <span />}
          </div>
        </article>
        {doc.outline?.length ? null : doc.headings.length > 0 ? (
          <aside className="rail" aria-label="On this page">
            <p className="kicker">On this page</p>
            <ol>
              {doc.headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? 'h3' : undefined}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>
    </>
  )
}

function hashId(hash: string): string {
  const raw = hash.replace(/^#/, '')
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

function Examples({ page }: { page: PageData }) {
  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <h1 className="page-title">Code</h1>
      <p className="lede">
        Topics are the names you study. The package directory stays the source address, listed in curriculum order.
      </p>
      <ul className="catalog">
        {page.packages!.map((pkg) => (
          <li key={pkg.pkg}>
            <Link to={pkg.url}>
              <span>{pkg.role}</span>
              <span className="mono">{pkg.pkg} · {pkg.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function PackagePage({ page }: { page: PageData }) {
  const pkg = page.package!
  if (pkg.pkg === 'pkg5leetcode') return <LeetCodeIndex page={page} />
  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <p className="kicker">{pkg.pkg}</p>
      <h1 className="page-title">{pkg.role}</h1>
      <p className="lede">{pkg.count} files in study order.</p>
      {pkg.chapter ? <p className="band-note">Chapter <Link to={pkg.chapter.href}>{pkg.chapter.title}</Link></p> : null}
      <ol className="catalog">
        {pkg.examples.map((example, index) => (
          <li key={example.path}>
            <Link to={example.url || pkg.url}>
              <span className="count">{String(index + 1).padStart(2, '0')}</span>
              <span>{codeLabel(example.className)}<span className="mono">{example.path}</span></span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}

function LeetCodeIndex({ page }: { page: PageData }) {
  const pkg = page.package!
  const [plan, setPlan] = useState('all')
  const plans = pkg.examples.reduce<{ id: string; label: string }[]>((list, example) => {
    const meta = example.leetcode
    if (!meta || list.some((item) => item.id === meta.planId)) return list
    list.push({ id: meta.planId, label: meta.plan })
    return list
  }, [])
  const visible = plan === 'all' ? pkg.examples : pkg.examples.filter((example) => example.leetcode?.planId === plan)
  const solutionCount = pkg.examples.filter((example) => example.leetcode && !example.leetcode.helper).length
  const groups = plans
    .map((item) => ({ ...item, examples: visible.filter((example) => example.leetcode?.planId === item.id) }))
    .filter((item) => item.examples.length > 0)

  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <p className="kicker">{pkg.pkg}</p>
      <h1 className="page-title">LeetCode</h1>
      <p className="lede">
        {solutionCount} self-tested Java solutions from the curriculum. Each row opens the file in this library. The pages do not add problem statements beyond the notes already in the source.
      </p>
      {pkg.chapter ? <p className="band-note">Chapter <Link to={pkg.chapter.href}>{pkg.chapter.title}</Link></p> : null}
      <div className="plan-filter">
        <label>
          Study plan
          <select value={plan} onChange={(event) => setPlan(event.target.value)}>
            <option value="all">All</option>
            {plans.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
      {groups.map((group) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`}>
          <h2 id={`${group.id}-heading`}>{group.label}</h2>
          <ol className="catalog">
            {group.examples.map((example) => (
              <li key={example.path}>
                <Link to={example.url || pkg.url}>
                  <span className="count">{example.leetcode?.problemNumber || '—'}</span>
                  <span>
                    {example.leetcode?.title || example.className}
                    <span className="solution-meta">
                      <span className="mono">{example.className}.java</span>
                      {example.leetcode?.difficulty ? <span>{example.leetcode.difficulty}</span> : null}
                      {example.leetcode?.grouping ? <span>{example.leetcode.grouping.name}</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  )
}

function ExamplePage({ page }: { page: PageData }) {
  const example = page.example!
  if (example.leetcode) return <LeetCodeSolution example={example} crumbs={page.breadcrumbs} />
  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <p className="kicker">{example.role}</p>
      <h1 className="page-title">{example.className}</h1>
      <dl className="facts">
        <div><dt>Path</dt><dd className="mono">{example.path}</dd></div>
        <div><dt>Package</dt><dd className="mono">{example.pkg}</dd></div>
        <div><dt>Study order</dt><dd>{example.studyOrder}</dd></div>
        <div><dt>Run</dt><dd>{example.modeLabel}</dd></div>
        {example.runCommand ? <div><dt>Command</dt><dd className="mono">{example.runCommand}</dd></div> : null}
        {example.javaVersion ? <div><dt>Version in the filename</dt><dd>Java {example.javaVersion}</dd></div> : null}
        {example.exampleType ? <div><dt>Example</dt><dd>{example.exampleType}</dd></div> : null}
        {example.requiredJava ? <div><dt>Requires</dt><dd>Java {example.requiredJava}</dd></div> : null}
        {example.dependencies.length > 0 ? <div><dt>Dependencies</dt><dd>{example.dependencies.join(', ')}</dd></div> : null}
        {example.linkedLesson ? <div><dt>Lesson</dt><dd><Link to={example.linkedLesson}>Back to the chapter</Link></dd></div> : null}
      </dl>
      <p className="band-note">There is no in-browser runner. This is the file from the curriculum, unchanged.</p>
      <CodePanel filename={example.path} html={example.html} source={example.source} />
    </>
  )
}

function LeetCodeSolution({ example, crumbs }: { example: NonNullable<PageData['example']>; crumbs?: PageData['breadcrumbs'] }) {
  const meta = example.leetcode!
  const title = meta.title || example.className
  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <p className="kicker">{meta.plan}</p>
      <h1 className="page-title">{title}</h1>
      <dl className="facts">
        {meta.problemNumber ? <div><dt>Problem</dt><dd>LC {meta.problemNumber}</dd></div> : null}
        {meta.difficulty ? <div><dt>Difficulty</dt><dd>{meta.difficulty}</dd></div> : null}
        {meta.grouping ? <div><dt>{meta.grouping.label}</dt><dd>{meta.grouping.name}</dd></div> : null}
        <div><dt>File</dt><dd className="mono">{example.className}.java</dd></div>
        <div><dt>Path</dt><dd className="mono">{example.path}</dd></div>
        {meta.declaredPackage ? <div><dt>Package</dt><dd className="mono">{meta.declaredPackage}</dd></div> : null}
        {example.runCommand ? <div><dt>Command</dt><dd className="mono">{example.runCommand}</dd></div> : null}
        {example.linkedLesson ? <div><dt>Lesson</dt><dd><Link to={example.linkedLesson}>Back to the chapter</Link></dd></div> : null}
      </dl>
      {meta.description ? <p>{meta.description}</p> : null}
      {(meta.approach || meta.complexity) ? (
        <dl className="facts">
          {meta.approach ? <div><dt>Approach</dt><dd>{meta.approach}</dd></div> : null}
          {meta.complexity ? <div><dt>Complexity</dt><dd>{meta.complexity}</dd></div> : null}
        </dl>
      ) : null}
      <p className="band-note"><Link to="/examples/pkg5leetcode">LeetCode solutions</Link></p>
      <p className="band-note">There is no in-browser runner. This is the file from the curriculum, unchanged.</p>
      <CodePanel filename={example.path} html={example.html} source={example.source} />
      <div className="pager">
        {meta.previous ? <Link to={meta.previous.href}>Previous<span>{meta.previous.title}</span></Link> : <span />}
        {meta.next ? <Link to={meta.next.href}>Next<span>{meta.next.title}</span></Link> : <span />}
      </div>
    </>
  )
}

function VersionsPage({ page }: { page: PageData }) {
  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <p className="kicker">Java 6 through Java 25</p>
      <h1 className="page-title">Java versions</h1>
      <p className="lede">Each release has its own page. A shorter page means that release changed less of the language. Preview, incubator, and experimental features keep the status they had in that release.</p>
      <ol className="plain">
        {page.catalog!.map((release) => (
          <li key={release.href}>
            <Link to={release.href}>Java {release.version}</Link>
            <span>{release.lts ? 'Long-term support' : release.spec}</span>
            <span className="detail">{release.ga}. {release.overview}</span>
          </li>
        ))}
      </ol>
      <p className="band-note">Java 5 remains in the <Link to="/docs/02-learn--21-JavaVersions">version chapter</Link> and in versions1Java5Features.java.</p>
    </>
  )
}

function VersionNav({ release }: { release: NonNullable<PageData['release']> }) {
  return (
    <nav className="pager" aria-label="Versions">
      {release.previous ? <Link to={release.previous.href}>Previous<span>{release.previous.title}</span></Link> : <span />}
      {release.next ? <Link to={release.next.href}>Next<span>{release.next.title}</span></Link> : <span />}
    </nav>
  )
}

function VersionPage({ page }: { page: PageData }) {
  const release = page.release!
  const [status, setStatus] = useState('all')
  const categories = [
    ['Language', 'language'],
    ['APIs / Libraries', 'apis'],
    ['JVM / Runtime', 'jvm'],
    ['Tools / Platform', 'tools'],
  ] as const
  const statuses = ['Final', 'Preview', 'Incubator', 'Experimental'] as const
  const present = statuses.filter((item) => release.features.some((feature) => feature.status === item))
  const visible = status === 'all' ? release.features : release.features.filter((feature) => feature.status === status)
  const groups = categories
    .map(([title, id]) => ({ title, id, features: visible.filter((feature) => feature.category === title) }))
    .filter((group) => group.features.length > 0)
  const lessons: { href: string; title: string }[] = []
  const seenLessons = new Set<string>()
  for (const feature of release.features) {
    if (!feature.lesson || seenLessons.has(feature.lesson.href)) continue
    seenLessons.add(feature.lesson.href)
    lessons.push(feature.lesson)
  }
  const projectLabel = release.projectUrl.includes('openjdk.org') || release.projectUrl.includes('openjdk.java.net')
    ? `OpenJDK JDK ${release.version} (leaves JavaMastery)`
    : 'Oracle Java SE specifications (leaves JavaMastery)'

  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <p className="kicker">JDK {release.version} · {release.spec}{release.lts ? ' · Long-term support' : ''}</p>
      <h1 className="page-title">Java {release.version}</h1>
      <p className="lede">{release.overview}</p>
      <VersionNav release={release} />
      {present.length > 1 ? (
        <>
          <h2>How to read the status</h2>
          <ul className="plain">
            {present.includes('Final') ? <li><strong>Final.</strong> The change shipped in this release as a permanent part of that release.</li> : null}
            {present.includes('Preview') ? <li><strong>Preview.</strong> It can be tried with <span className="mono">--enable-preview</span>. A preview is not a permanent language or API guarantee.</li> : null}
            {present.includes('Incubator') ? <li><strong>Incubator.</strong> An incubator API is not a supported standard API. It can change or be removed.</li> : null}
            {present.includes('Experimental') ? <li><strong>Experimental.</strong> The feature shipped so it can be refined. It is not Final, and it is not the default form of that technology.</li> : null}
          </ul>
          <div className="plan-filter">
            <label>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All</option>
                {present.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </>
      ) : null}
      <nav aria-label="Features">
        <ul className="plain">
          {groups.map((group) => (
            <li key={group.id}><a href={`#${group.id}`}>{group.title}</a></li>
          ))}
        </ul>
      </nav>
      {groups.map((group) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`}>
          <h2 id={`${group.id}-heading`}>{group.title}</h2>
          {group.features.map((feature) => (
            <article key={feature.id} id={feature.id} className="jep">
              <h3>{feature.name}</h3>
              <p className="solution-meta">{feature.jep ? `JEP ${feature.jep} · ` : ''}{feature.status} · {feature.category}</p>
              <p>{feature.summary}</p>
              {feature.history ? <p>{feature.history}</p> : null}
              {feature.jepUrl ? <p><a href={feature.jepUrl} rel="noopener noreferrer">OpenJDK JEP {feature.jep} (leaves JavaMastery)</a></p> : null}
              {feature.lesson ? <p>Related reading: <Link to={feature.lesson.href}>{feature.lesson.title}</Link></p> : null}
              {feature.example ? <p>Curriculum file: <Link to={feature.example.href}>{feature.example.title}</Link></p> : null}
            </article>
          ))}
        </section>
      ))}
      {release.also ? <p>{release.also}</p> : null}
      {release.examples.length > 0 ? (
        <section aria-labelledby="examples-heading">
          <h2 id="examples-heading">Examples</h2>
          <ul className="plain">
            {release.examples.map((example) => (
              <li key={example.href}>
                <Link to={example.href}>{example.title}</Link>
                <span className="solution-meta">{`${example.exampleType} · Requires Java ${example.requiredJava}`}</span>
                <span className="detail">{example.note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {lessons.length > 0 ? (
        <section aria-labelledby="reading-heading">
          <h2 id="reading-heading">Related reading</h2>
          <ul className="plain">
            {lessons.map((item) => (
              <li key={item.href}><Link to={item.href}>{item.title}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
      {release.historical ? (
        <section aria-labelledby="history-heading">
          <h2 id="history-heading">Historical notes</h2>
          <p>{release.historical}</p>
        </section>
      ) : null}
      <p>Sources. {release.sources} <a href={release.projectUrl} rel="noopener noreferrer">{projectLabel}</a></p>
      <p><Link to="/versions">All versions</Link></p>
      <VersionNav release={release} />
    </>
  )
}

function Projects({ page }: { page: PageData }) {
  return (
    <>
      <Breadcrumbs crumbs={page.breadcrumbs} />
      <h1 className="page-title">Projects</h1>
      <p className="lede">Labs beside the chapters. The code stays under projects/ and pkg21spring.</p>
      <ul className="plain">
        {page.projects!.map((project) => (
            <li key={project.dir} id={project.dir}>
            <strong>{project.title}</strong>
            <span className="detail">{project.description}</span>
            {project.lesson ? <Link to={project.lesson.href}>{project.lesson.title}</Link> : null}
          </li>
        ))}
      </ul>
    </>
  )
}

function Bookmarks() {
  const [items, setItems] = useState<Bookmark[] | null>(null)
  useEffect(() => {
    setItems(readBookmarks())
  }, [])
  return (
    <>
      <h1 className="page-title">Bookmarks</h1>
      <p className="lede">Saved on this device only. This page is not indexed.</p>
      {!items ? <p role="status">Loading bookmarks saved in this browser.</p> : items.length === 0 ? <p>No pages saved yet. Open a chapter and save it.</p> : (
        <ul className="catalog">
          {items.map((item) => (
            <li key={item.url}><Link to={item.url}>{item.title}</Link></li>
          ))}
        </ul>
      )}
    </>
  )
}

function codeLabel(className: string): string {
  const stem = className.replace(/^[a-z]+\d+/, '').replace(/^_+/, '')
  return stem || className
}

function NamedSources({ id, title, items }: { id: string; title: string; items: { path: string; url: string | null; className: string }[] }) {
  if (!items.length) return null
  return (
    <section className="band" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul className="plain">
        {items.map((example) => (
          <li key={example.path}>
            {example.url ? <Link to={example.url}>{example.className}</Link> : example.className}
            <span className="mono">{example.path}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NamedPages({ id, title, items }: { id: string; title: string; items?: { href: string; title: string }[] }) {
  if (!items?.length) return null
  return (
    <section className="band" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <ul className="plain">
        {items.map((item) => (
          <li key={item.href}><Link to={item.href}>{item.title}</Link></li>
        ))}
      </ul>
    </section>
  )
}

function BookmarkControl({ url, title }: { url: string; title: string }) {
  const [saved, setSaved] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setSaved(readBookmarks().some((item) => item.url === url))
    setReady(true)
  }, [url])
  if (!ready) return null
  return (
    <button
      className="text-button bookmark-button"
      type="button"
      onClick={() => {
        const current = readBookmarks()
        const next = saved ? current.filter((item) => item.url !== url) : [...current, { url, title }]
        if (writeBookmarks(next)) setSaved(!saved)
      }}
    >
      {saved ? 'Remove bookmark' : 'Save bookmark'}
    </button>
  )
}
