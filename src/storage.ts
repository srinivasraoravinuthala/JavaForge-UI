const THEME_KEY = 'javaforge.theme'
const BOOKMARK_KEY = 'javaforge.bookmarks'
const PLACE_KEY = 'javaforge.place'

export interface Bookmark {
  url: string
  title: string
}

export function storedTheme(): 'light' | 'dark' | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

export function saveTheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // The chosen theme still applies for this visit when storage is blocked.
  }
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false
  const item = value as Bookmark
  return typeof item.url === 'string' && item.url.startsWith('/') && typeof item.title === 'string' && item.title.length > 0 && item.title.length < 300
}

export function readBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isBookmark)
  } catch {
    return []
  }
}

export function writeBookmarks(items: Bookmark[]): boolean {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

export function readPlace(): string | null {
  try {
    const value = localStorage.getItem(PLACE_KEY)
    return value && value.startsWith('/') ? value : null
  } catch {
    return null
  }
}

export function writePlace(url: string) {
  try {
    localStorage.setItem(PLACE_KEY, url)
  } catch {
    // Reading position is optional and must not block the page.
  }
}
