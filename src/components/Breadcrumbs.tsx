import { Link } from 'react-router-dom'
import type { Crumb } from '../types'

export function Breadcrumbs({ crumbs }: { crumbs?: Crumb[] }) {
  if (!crumbs?.length) return null
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <li key={`${crumb.href}-${crumb.name}`}>
              {index > 0 ? <span aria-hidden="true"> / </span> : null}
              {last ? <span aria-current="page">{crumb.name}</span> : <Link to={crumb.href}>{crumb.name}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
