import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './styles/global.css'
import './styles/print.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('The Paper Airplane Lab root element is missing.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

function markReadyWhenRendered(attempt = 0): void {
  if (!document.getElementById('boot-status')) {
    document.documentElement.setAttribute('data-pal-ready', 'true')
    return
  }

  if (attempt < 120) {
    window.requestAnimationFrame(() => markReadyWhenRendered(attempt + 1))
  }
}

window.requestAnimationFrame(() => markReadyWhenRendered())
