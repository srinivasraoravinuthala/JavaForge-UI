import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { type PageData } from './types'
import './styles/global.css'

declare global {
  interface Window {
    __PAGE__?: PageData
  }
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

const initial = window.__PAGE__ ?? null
const app = (
  <BrowserRouter>
    <App initial={initial} />
  </BrowserRouter>
)

if (root.childNodes.length > 0) hydrateRoot(root, app)
else createRoot(root).render(app)
