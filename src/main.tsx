import ReactDOM from 'react-dom/client';
import React from 'react';
import App from './App';
import './index.css';
import { applyTheme, loadTheme, watchSystemTheme } from './lib/themeStore';

applyTheme(loadTheme());
watchSystemTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
