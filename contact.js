/* Shared pop-out contact panel — triggered by any [data-contact] link.
   Compiles the message into a mailto (no backend); falls back to a plain
   mailto link if JS is off. Project-inquiry link sits where socials would. */
(function () {
  var EMAIL = 'hello@ashcornette.com';

  var overlay = document.createElement('div');
  overlay.className = 'contact-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="contact-panel" role="dialog" aria-modal="true" aria-label="Contact">' +
      '<button type="button" class="contact-close" aria-label="Close contact form">×</button>' +
      '<p class="contact-eyebrow">say hello</p>' +
      '<form class="contact-form" novalidate>' +
        '<div class="contact-row">' +
          '<label class="contact-field"><span>your name</span><input type="text" name="name" autocomplete="name"></label>' +
          '<label class="contact-field"><span>your email</span><input type="email" name="email" autocomplete="email"></label>' +
        '</div>' +
        '<label class="contact-field"><span>message</span><textarea name="message" rows="3" placeholder="A sentence or two is plenty."></textarea></label>' +
        '<button type="submit" class="pill">send →</button>' +
      '</form>' +
      '<div class="contact-alt">Unsure? <a href="inquiry.html">Start a project inquiry →</a></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var panel = overlay.querySelector('.contact-panel');
  var form = overlay.querySelector('.contact-form');
  var lastFocus = null;

  function positionTo(trigger) {
    // on small screens the panel is a full-width sheet (styled in CSS); clear inline coords
    if (window.innerWidth <= 720) { panel.style.top = ''; panel.style.right = ''; return; }
    if (!trigger || !trigger.getBoundingClientRect) return;
    var r = trigger.getBoundingClientRect();
    panel.style.top = Math.round(r.bottom + 10) + 'px';
    panel.style.right = Math.round(Math.max(16, window.innerWidth - r.right)) + 'px';
  }
  function open(e) {
    if (e) e.preventDefault();
    lastFocus = (e && e.currentTarget) || document.activeElement;
    positionTo(lastFocus);
    overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    var first = form.querySelector('input');
    if (first) first.focus();
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
  }
  function reposition() { positionTo(lastFocus); }
  function close() {
    overlay.hidden = true;
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', reposition);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      var f = panel.querySelectorAll('a[href], button, input, textarea');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  [].forEach.call(document.querySelectorAll('[data-contact]'), function (el) {
    el.addEventListener('click', open);
  });
  overlay.querySelector('.contact-close').addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = (form.elements['name'].value || '').trim();
    var email = (form.elements['email'].value || '').trim();
    var msg = (form.elements['message'].value || '').trim();
    var subject = name ? ('Hello from ' + name) : 'Hello';
    var lines = [];
    if (msg) lines.push(msg, '');
    lines.push('— ' + (name || 'via ashcornette.com') + (email ? ' · ' + email : ''));
    var href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
    window.location.href = href;
  });
})();
