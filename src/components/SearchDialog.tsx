import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchDocuments, type SearchDocument } from '../search'

const KIND: Record<SearchDocument['type'], string> = {
  lesson: 'Lesson',
  example: 'Code',
  interview: 'Interview',
  leetcode: 'LeetCode',
  project: 'Project',
  reference: 'Reference',
  version: 'Version',
}

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

function usableIndex(data: unknown): data is SearchDocument[] {
  if (!Array.isArray(data) || data.length === 0) return false
  return data.every((item) => {
    if (!item || typeof item !== 'object') return false
    const doc = item as SearchDocument
    return typeof doc.id === 'string' && typeof doc.title === 'string' && typeof doc.url === 'string' && doc.url.startsWith('/') && typeof doc.type === 'string'
  })
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const listId = useId()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [documents, setDocuments] = useState<SearchDocument[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      dialog.showModal()
      inputRef.current?.focus()
    }
    if (!open && dialog.open) {
      dialog.close()
      opener.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open || documents) return
    let cancel = false
    setFailed(false)
    fetch('/content/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error('search index')
        return res.json() as Promise<SearchDocument[]>
      })
      .then((data) => {
        if (cancel) return
        if (!usableIndex(data)) {
          setFailed(true)
          return
        }
        setDocuments(data)
      })
      .catch(() => {
        if (!cancel) setFailed(true)
      })
    return () => {
      cancel = true
    }
  }, [open, documents])

  useEffect(() => {
    setActive(0)
  }, [query])

  const ready = query.trim().length >= 2
  let results: SearchDocument[] = []
  let searchFailed = false
  if (documents && ready) {
    try {
      results = searchDocuments(documents, query)
    } catch {
      searchFailed = true
    }
  }
  const current = results.length ? Math.min(active, results.length - 1) : 0
  const activeId = results.length ? `${listId}-${current}` : undefined

  useEffect(() => {
    if (!activeId) return
    document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' })
  }, [activeId])

  let message = 'Search lessons, code, interviews, and reference pages.'
  if (failed || searchFailed) message = 'The search index did not load. The rest of the library is still available.'
  else if (open && ready && !documents) message = 'Loading the index.'
  else if (ready && documents && results.length === 0) {
    message = `No results for “${query.trim()}”. Try a Java concept, a package, a class name, or an interview topic.`
  } else if (ready && results.length > 0) message = `${results.length} results`

  return (
    <dialog
      ref={dialogRef}
      className="search-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="search-bar">
        <h2 id={titleId} className="search-title">Search JavaMastery</h2>
        <button className="text-button" type="button" onClick={onClose}>Close</button>
      </div>
      <input
        ref={inputRef}
        className="search-input"
        value={query}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={results.length > 0 ? listId : undefined}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((index) => (results.length ? (Math.min(index, results.length - 1) + 1) % results.length : 0))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => (results.length ? (Math.min(index, results.length - 1) - 1 + results.length) % results.length : 0))
          } else if (event.key === 'Enter' && results[current]) {
            event.preventDefault()
            navigate(results[current].url)
            onClose()
          }
        }}
        placeholder="Search JavaMastery"
        aria-label="Search JavaMastery"
        autoComplete="off"
        enterKeyHint="search"
      />
      <p className={results.length ? 'visually-hidden' : 'search-note'} role="status">{message}</p>
      {results.length > 0 ? (
        <ul id={listId} className="search-results" role="listbox" aria-label="Search results">
          {results.map((result, index) => (
            <li key={result.id} id={`${listId}-${index}`} role="option" aria-selected={index === current}>
              <Link
                className="search-hit"
                to={result.url}
                onClick={onClose}
                onMouseMove={() => setActive(index)}
              >
                <span className="search-kind">{KIND[result.type]}</span>
                <span className="search-hit-title">{result.title}</span>
                {result.description ? <span className="search-hit-detail">{result.description}</span> : null}
                {result.hint ? <span className="mono">{result.hint}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </dialog>
  )
}
