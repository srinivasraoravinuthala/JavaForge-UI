import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './App'
import { renderHead } from './seo'
import type { PageData } from './types'

export function render(url: string, page: PageData) {
  return renderToString(
    <StaticRouter location={url}>
      <App initial={page} />
    </StaticRouter>,
  )
}

export { renderHead }
