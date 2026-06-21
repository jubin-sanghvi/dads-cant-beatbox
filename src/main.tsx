import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App'
import './styles/index.css'

// Theme init — before render to avoid flash
const saved = localStorage.getItem('dcb-theme') || 'light'
document.documentElement.dataset.theme = saved

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
