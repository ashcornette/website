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

// Mobile nav drawer
// (function () {
//   const toggle = document.querySelector('.menu-toggle');
//   const drawer = document.getElementById('mobile-drawer');
//   const overlay = document.getElementById('mobile-overlay');
//   const closeBtn = document.getElementById('drawer-close');

//   function openDrawer() {
//     drawer.classList.add('is-open');
//     drawer.setAttribute('aria-hidden', 'false');
//     overlay.classList.add('is-open');
//     toggle.classList.add('is-open');
//     document.body.style.overflow = 'hidden';
//   }

//   function closeDrawer() {
//     drawer.classList.remove('is-open');
//     drawer.setAttribute('aria-hidden', 'true');
//     overlay.classList.remove('is-open');
//     toggle.classList.remove('is-open');
//     document.body.style.overflow = '';
//   }

//   if (toggle) toggle.addEventListener('click', openDrawer);
//   if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
//   if (overlay) overlay.addEventListener('click', closeDrawer);

//   document.addEventListener('keydown', function (e) {
//     if (e.key === 'Escape') closeDrawer();
//   });
// })();
