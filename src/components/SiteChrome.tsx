import { Link, NavLink } from 'react-router-dom'
import { Logo } from './Logo'

const SOURCE = 'https://github.com/srinivasraoravinuthala/JavaMastery'

export function SiteHeader({
  theme,
  onTheme,
  onSearch,
}: {
  theme: 'light' | 'dark'
  onTheme: () => void
  onSearch: () => void
}) {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <Logo />
        <span>JavaMastery</span>
      </Link>
      <nav className="nav-main" aria-label="Primary">
        <NavLink to="/learn">Learn</NavLink>
        <NavLink to="/examples">Code</NavLink>
        <NavLink to="/projects">Projects</NavLink>
      </nav>
      <div className="header-tools">
        <button className="search-trigger" type="button" onClick={onSearch} aria-keyshortcuts="Control+K Meta+K">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span>Search</span>
          <span className="wide-only"> JavaMastery</span>
          <kbd className="wide-only">Ctrl K</kbd>
        </button>
        <a className="text-button wide-only" href={SOURCE}>Source</a>
        <button className="text-button" type="button" onClick={onTheme}>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="inner">
        <p>JavaMastery. Chapters and Java files live in the curriculum. Bookmarks and your place in the path stay in this browser.</p>
        <nav aria-label="Footer">
          <Link to="/learn">Learning path</Link>
          <Link to="/examples">Code</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/docs/03-interview--00-INDEX">Interview</Link>
          <Link to="/docs/04-reference--00-INDEX">Reference</Link>
          <Link to="/bookmarks">Bookmarks</Link>
          <a href={SOURCE}>Source</a>
        </nav>
      </div>
    </footer>
  )
}

export function MobileNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/learn">Learn</NavLink>
      <NavLink to="/examples">Code</NavLink>
      <NavLink to="/projects">Projects</NavLink>
    </nav>
  )
}
