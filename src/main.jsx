import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/tinos/400.css';
import '@fontsource/tinos/700.css';
import './style.css';

createRoot(document.getElementById('root')).render(<App />);
