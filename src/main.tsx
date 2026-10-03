import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved theme before paint to avoid flash
const saved = localStorage.getItem('portfolio-theme') ?? 'dark'
document.documentElement.setAttribute('data-theme', saved)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
