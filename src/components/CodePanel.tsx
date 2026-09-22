import { useState } from 'react'

export function CodePanel({ filename, html, source }: { filename: string; html: string; source: string }) {
  const [label, setLabel] = useState('Copy')
  return (
    <div className="code-panel">
      <div className="code-toolbar">
        <span className="code-filename">{filename}</span>
        <button
          className="text-button"
          type="button"
          aria-live="polite"
          onClick={() => {
            navigator.clipboard.writeText(source).then(() => {
              setLabel('Copied')
              window.setTimeout(() => setLabel('Copy'), 2000)
            }).catch(() => setLabel('Copy unavailable'))
          }}
        >
          {label}
        </button>
      </div>
      <div className="code-scroll" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
