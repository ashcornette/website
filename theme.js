(function () {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const DARK = 'dark';
  const LIGHT = 'light';

  const MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const SUN  = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  function applyTheme(theme) {
    if (theme === DARK) {
      root.setAttribute('data-theme', DARK);
      if (btn) btn.setAttribute('aria-label', 'Switch to light mode');
      if (btn) btn.innerHTML = SUN;
    } else {
      root.removeAttribute('data-theme');
      if (btn) btn.setAttribute('aria-label', 'Switch to dark mode');
      if (btn) btn.innerHTML = MOON;
    }
  }

  const saved = localStorage.getItem('theme') || LIGHT;
  applyTheme(saved);

  if (btn) {
    btn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') === DARK ? DARK : LIGHT;
      const next = current === LIGHT ? DARK : LIGHT;
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }
})();
