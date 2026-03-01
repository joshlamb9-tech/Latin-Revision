'use strict';

// --- Nav toggle ---
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is tapped (mobile)
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Service Worker registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[CE Latin] SW registered, scope:', reg.scope))
      .catch(err => console.warn('[CE Latin] SW registration failed:', err));
  });
}
