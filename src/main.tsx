import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import fileLogger from './services/fileLogger'
import { config } from './config'

// Логируем режим запуска приложения
const appMode = config.api.baseUrl.includes('/api') ? 'LOCAL' : 'PROD';
fileLogger.logAppMode(appMode, {
  apiBaseUrl: config.api.baseUrl,
  useProxy: config.api.baseUrl.includes('/api'),
  environment: {
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
