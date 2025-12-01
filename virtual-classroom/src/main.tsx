import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug: Log environment variables (remove in production)
console.log('Environment check:', {
  hasAgoraAppId: !!import.meta.env.VITE_AGORA_APP_ID,
  hasBackendUrl: !!import.meta.env.VITE_BACKEND_URL,
  hasOpenAIKey: !!import.meta.env.VITE_OPENAI_API_KEY,
  env: import.meta.env.VITE_ENV || 'not set'
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
