(function () {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const DARK = 'dark';
  const LIGHT = 'light';

  const toggle = document.querySelector('.toggle-input');
  const toggleTag = document.querySelector('.toggle-state-tag');

  function applyTheme(theme) {
    if (theme === DARK) {
      root.setAttribute('data-theme', DARK);
      if (btn) btn.setAttribute('aria-label', 'Switch to light mode');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
      if (toggle) toggle.checked = true;
      if (toggleTag) toggleTag.textContent = 'On';
    } else {
      root.removeAttribute('data-theme');
      if (btn) btn.setAttribute('aria-label', 'Switch to dark mode');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
      if (toggle) toggle.checked = false;
      if (toggleTag) toggleTag.textContent = 'Off';
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

  if (toggle) {
    toggle.addEventListener('change', function () {
      const next = toggle.checked ? DARK : LIGHT;
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }
})();