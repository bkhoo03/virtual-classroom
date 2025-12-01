import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debug: Log environment variables (remove in production)
console.log('Environment check:', {
  hasAgoraAppId: !!import.meta.env.VITE_AGORA_APP_ID,
  hasBackendUrl: !!import.meta.env.VITE_BACKEND_URL,
  hasOpenAIKey: !!import.meta.env.VITE_OPENAI_API_KEY,
  env: import.meta.env.VITE_ENV || 'not set',
  allEnvKeys: Object.keys(import.meta.env)
});

// Additional safety check
if (typeof import.meta.env.VITE_AGORA_APP_ID === 'undefined') {
  console.error('CRITICAL: VITE_AGORA_APP_ID is undefined at runtime!');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Application Error</h1>
      <p>Failed to initialize the application. Please check the console for details.</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
