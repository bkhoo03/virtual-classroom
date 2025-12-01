/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AGORA_APP_ID: string
  readonly VITE_AGORA_WHITEBOARD_APP_ID: string
  readonly VITE_AGORA_WHITEBOARD_AK: string
  readonly VITE_AGORA_WHITEBOARD_SK: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_API_ENDPOINT: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_SERPER_API_KEY: string
  readonly VITE_BRAVE_API_KEY?: string
  readonly VITE_UNSPLASH_ACCESS_KEY: string
  readonly VITE_ENV: string
  readonly VITE_DEBUG_MODE?: string
  readonly VITE_WS_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
