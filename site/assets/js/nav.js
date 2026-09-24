/* Mobile navigation — open/close, scroll lock, Escape, focus return. */
(function () {
  'use strict';

  var burger = document.querySelector('[data-nav-open]');
  var panel = document.getElementById('mobile-nav');
  if (!burger || !panel) return;

  var closer = panel.querySelector('[data-nav-close]');
  var lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    panel.dataset.open = 'true';
    document.body.dataset.lock = 'true';
    burger.setAttribute('aria-expanded', 'true');
    (closer || panel).focus();
  }

  function close() {
    panel.dataset.open = 'false';
    delete document.body.dataset.lock;
    burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  burger.addEventListener('click', open);
  if (closer) closer.addEventListener('click', close);

  // any link in the panel navigates, so shut the panel behind it
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.dataset.open === 'true') close();
  });

  // if the viewport grows past the breakpoint while open, the desktop nav is
  // back and a full-screen overlay would be stranded on screen
  var mq = window.matchMedia('(min-width: 861px)');
  var onChange = function (e) { if (e.matches && panel.dataset.open === 'true') close(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else mq.addListener(onChange);
})();
