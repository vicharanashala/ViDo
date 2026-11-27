import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';
import './index.css';
import { initializeTheme } from './lib/theme';

// Synchronously initialize theme to avoid flash of wrong mode on boot
initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
