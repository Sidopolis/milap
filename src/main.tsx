import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import gsap from 'gsap';

// Make GSAP available globally for animation hooks
window.gsap = gsap;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
