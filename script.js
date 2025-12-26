/**
 * 121WATTS â€” Minimal interactions
 * - Theme toggle (data-theme on <html>, persisted)
 * - Calm reveal observer (.power-on -> .powered)
 * - Copy email + Print
 * No constant animations / canvas loops.
 */

(() => {
  'use strict';

  const STORAGE_KEY = 'theme';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }

  function applyTheme(theme, { persist = false } = {}) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);

    const toggle = document.querySelector('[data-action="theme-toggle"]');
    if (toggle) {
      const isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      // Keep label visually minimal; this is mostly for SR users.
      toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }

    if (persist) setStoredTheme(theme);
  }

  function initTheme() {
    const stored = getStoredTheme();
    const initial = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    applyTheme(initial, { persist: false });

    const toggle = document.querySelector('[data-action="theme-toggle"]');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, { persist: true });
    });
  }

  function initPowerOnReveals() {
    const nodes = Array.from(document.querySelectorAll('.power-on'));
    if (nodes.length === 0) return;

    if (prefersReducedMotion) {
      nodes.forEach(el => el.classList.add('powered'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('powered');
            observer.unobserve(entry.target);
          }
        }
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    nodes.forEach(el => observer.observe(el));
  }

  function announce(message) {
    const live = document.getElementById('live-region');
    if (!live) return;

    // Reset so repeating the same message still announces.
    live.textContent = '';
    window.setTimeout(() => {
      live.textContent = message;
    }, 20);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function initActions() {
    document.addEventListener('click', async (e) => {
      const target = e.target instanceof Element ? e.target.closest('[data-action]') : null;
      if (!target) return;

      const action = target.getAttribute('data-action');

      if (action === 'print') {
        window.print();
        return;
      }

      if (action === 'copy-email') {
        const email = target.getAttribute('data-email') || 'andrew.watkinz@gmail.com';
        try {
          await copyText(email);
          announce('Email copied.');
        } catch {
          announce('Could not copy email.');
        }
      }
    });
  }

  function init() {
    initTheme();
    initPowerOnReveals();
    initActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();