import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App.tsx'
import './App.css'

console.log('🚀 main.tsx is loading...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics mode="production" />
  </StrictMode>,
)
