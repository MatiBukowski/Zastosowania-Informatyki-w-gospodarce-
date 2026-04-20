import React from 'react'
import ReactDOM from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import App from './App'

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
  </React.StrictMode>,
)
