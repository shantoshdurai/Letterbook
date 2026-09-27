import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { isNativeApp } from './lib/share';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Offline support + automatic updates for the website / installed PWA. The Android
// app already ships its files inside the APK, so it skips the service worker.
if (import.meta.env.PROD && !isNativeApp()) {
  registerSW({ immediate: true });
  // v1.0.0 cached covers without CORS, which broke the Story card image; drop that cache.
  if ('caches' in window) caches.delete('images').catch(() => {});
}
