/* ================================================================
   main.js — Shared: nav scroll + hamburger menu
   ================================================================ */

(function () {
  'use strict';

  const nav        = document.getElementById('mainNav');
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobileNav');

  /* ---- Nav scroll behaviour ----------------------------------- */
  // On interior pages the nav starts scrolled; on home it fades in.
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      // Only remove on pages where nav starts transparent (home)
      if (!nav.classList.contains('nav--scrolled-always')) {
        nav.classList.remove('nav--scrolled');
      }
    }
  }

  if (nav && !nav.classList.contains('nav--scrolled')) {
    // Home page — start transparent, add on scroll
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ---- Hamburger / mobile overlay ---------------------------- */
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const open = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on any mobile link click
    mobileNav.querySelectorAll('.nav__mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
})();
