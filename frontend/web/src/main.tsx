import React from 'react'
import ReactDOM from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

// Add global styles
const style = document.createElement('style');
style.textContent = `
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  /* View Transitions API styles */
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.3s;
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(root) {
      animation: none;
    }
  }
`;
document.head.appendChild(style);

posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
