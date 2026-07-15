/* Shared pop-out contact panel — triggered by any [data-contact] link.
   Compiles the message into a mailto (no backend); falls back to a plain
   mailto link if JS is off. Project-inquiry link sits where socials would. */
(function () {
  var EMAIL = 'hello@ashcornette.com';
  var ENDPOINT = 'https://inquiry-worker.complexash.workers.dev/api/inquiry';

  /* Single submit path for both the contact panel and inquiry.html:
     try the Worker first; only fall back to a mailto if it doesn't take it.
     Previously both fired the mailto unconditionally, so a successful send
     still popped the visitor's mail client alongside a "thank you". */
  function post(payload) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    });
  }
  window.ashPost = post;

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
        '<p class="contact-err" role="alert" hidden></p>' +
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
    if (window.innerWidth <= 720) {
      panel.style.top = ''; panel.style.right = ''; panel.style.bottom = '';
      panel.classList.remove('up');
      return;
    }
    if (!trigger || !trigger.getBoundingClientRect) return;
    var r = trigger.getBoundingClientRect();
    var h = panel.offsetHeight || 420;
    panel.style.right = Math.round(Math.max(16, window.innerWidth - r.right)) + 'px';
    if (window.innerHeight - r.bottom < h + 24) {
      // not enough room below (e.g. the footer CTA) → open upward from the button.
      // top must be 'auto', not '' — clearing it would fall back to the stylesheet's
      // top:76px and stretch the panel between top and bottom.
      panel.classList.add('up');
      panel.style.top = 'auto';
      panel.style.bottom = Math.round(Math.max(16, window.innerHeight - r.top + 10)) + 'px';
    } else {
      panel.classList.remove('up');
      panel.style.bottom = 'auto';
      panel.style.top = Math.round(r.bottom + 10) + 'px';
    }
  }
  function open(e) {
    if (e) e.preventDefault();
    lastFocus = (e && e.currentTarget) || document.activeElement;
    overlay.hidden = false;                 // show first so the panel can be measured
    document.documentElement.style.overflow = 'hidden';
    positionTo(lastFocus);
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
    var err = form.querySelector('.contact-err');

    // an email with no reply address is one Ash can read but never answer
    if (!msg || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = !msg ? 'Add a message first.'
                      : !email ? 'Add your email so I can reply.'
                      : 'That email doesn’t look right — mind checking it?';
      err.hidden = false;
      (!msg ? form.elements['message'] : form.elements['email']).focus();
      return;
    }
    err.hidden = true;

    var subject = name ? ('Hello from ' + name) : 'Hello';
    var lines = [];
    if (msg) lines.push(msg, '');
    lines.push('— ' + (name || 'via ashcornette.com') + (email ? ' · ' + email : ''));
    var href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));

    // best-effort copy to the Worker (a log, not the delivery path) — never
    // block or gate the mailto on it
    post({ source: 'contact', name: name, email: email, message: msg }).catch(function () {});

    // the mailto IS the delivery: it opens a draft, it does not send.
    window.location.href = href;
    ack({ title: 'Thank you.' });
  });

  /* ---- shared acknowledgement — also used by inquiry.html via window.ashAck ---- */
  var ackEl = null, ackTimer = null;

  function ack(o) {
    close();
    if (!ackEl) {
      ackEl = document.createElement('div');
      ackEl.className = 'contact-overlay';
      document.body.appendChild(ackEl);
    }
    // role="alert" (a live region), not alertdialog — there's nothing to
    // interact with any more, so it's a transient notice, not a dialog.
    ackEl.innerHTML =
      '<div class="contact-panel ack" role="alert">' +
        (o.eyebrow ? '<p class="contact-eyebrow">' + o.eyebrow + '</p>' : '') +
        '<p class="ack-title">' + o.title + '</p>' +
        (o.body ? '<p class="ack-body">' + o.body + '</p>' : '') +
      '</div>';
    ackEl.hidden = false;
    document.documentElement.style.overflow = 'hidden';

    var done = false;
    function dismiss() {
      if (done) return;                       // timer and click can race
      done = true;
      clearTimeout(ackTimer); ackTimer = null;
      ackEl.hidden = true;
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
      if (typeof o.onClose === 'function') o.onClose();
    }
    function onEsc(e) { if (e.key === 'Escape') dismiss(); }

    // let people leave early rather than wait out the timer
    ackEl.addEventListener('click', dismiss);
    document.addEventListener('keydown', onEsc);

    ackTimer = setTimeout(dismiss, 1500);
  }

  window.ashAck = ack;
})();
