import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { readPlace } from '../storage'
import type { Stage } from '../types'

export function PathList({ stages }: { stages: Stage[] }) {
  const [place, setPlace] = useState<string | null>(null)
  useEffect(() => {
    setPlace(readPlace())
  }, [])

  const current = place ? stages.findIndex((stage) => stage.chapterHrefs.includes(place)) : -1

  return (
    <ol className="path">
      {stages.map((stage, index) => {
        const state = current < 0 ? null : index < current ? 'done' : index === current ? 'now' : index === current + 1 ? 'next' : null
        const label = state === 'done' ? 'Done' : state === 'now' ? 'Now' : state === 'next' ? 'Next' : ''
        return (
          <li key={stage.id}>
            <span className="path-index">{String(index + 1).padStart(2, '0')}</span>
            <Link to={stage.href}>{stage.label}</Link>
            <span className="path-state" data-state={state || 'none'}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
