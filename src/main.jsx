import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Register a minimal service worker (only if none is active at the root
// scope) so web notifications use ServiceWorkerRegistration.showNotification,
// the spec-preferred path over the direct Notification constructor. A
// platform-managed service worker, if present, is left in control.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistration('/')
    .then((reg) => { if (!reg) navigator.serviceWorker.register('/sw.js').catch(() => {}); })
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)