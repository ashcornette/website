(function () {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const DARK = 'dark';
  const LIGHT = 'light';

  function applyTheme(theme) {
    if (theme === DARK) {
      root.setAttribute('data-theme', DARK);
      if (btn) btn.setAttribute('aria-label', 'Switch to light mode');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
    } else {
      root.removeAttribute('data-theme');
      if (btn) btn.setAttribute('aria-label', 'Switch to dark mode');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
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
