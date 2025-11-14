import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@tldraw/tldraw/tldraw.css'
import './index.css';

// 💡 FIX: This line imports Tldraw's required base styles globally
import '@tldraw/tldraw/tldraw.css'; 


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ❌ CODE REMOVED: The following block was removed because 'window.electronAPI.on'
// is causing the TypeError, meaning that function was not exposed via the context bridge.
/*
window.electronAPI.on('main-process-message', (data) => {
  console.log('Main process message:', data);
});
*/