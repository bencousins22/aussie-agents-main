import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { preconnect } from 'react-dom'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/layout/ErrorBoundary.tsx'

// React 19 Resource Hints
preconnect('https://fonts.googleapis.com')
preconnect('https://fonts.gstatic.com')

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
