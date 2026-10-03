import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AdminPage from './pages/AdminPage'

// Apply saved theme
const saved = localStorage.getItem('portfolio-theme') ?? 'dark'
document.documentElement.setAttribute('data-theme', saved)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminPage />
  </StrictMode>,
)
