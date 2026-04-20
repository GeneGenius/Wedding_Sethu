/* ================================================================
   gallery.js — Lightbox for gallery images
   Click any image to open full-screen; navigate with arrows or
   keyboard left/right; close with × button, backdrop click, or Esc.
   ================================================================ */

(function () {
  'use strict';

  var lightbox   = document.getElementById('lightbox');
  var lbImg      = document.getElementById('lbImg');
  var lbCounter  = document.getElementById('lbCounter');
  var lbClose    = document.getElementById('lbClose');
  var lbPrev     = document.getElementById('lbPrev');
  var lbNext     = document.getElementById('lbNext');

  // Collect all gallery images that have a real src
  var items = Array.from(document.querySelectorAll('.gallery__item'));
  var images = items.map(function (item) {
    var img = item.querySelector('.gallery__img');
    return { src: img ? img.src : '', alt: img ? img.alt : '' };
  }).filter(function (img) { return img.src && !img.src.endsWith('/'); });

  var current = 0;

  if (!lightbox || images.length === 0) return;

  /* ---- Open --------------------------------------------------- */
  function open(index) {
    current = (index + images.length) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
    lbCounter.textContent = (current + 1) + ' / ' + images.length;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  /* ---- Close -------------------------------------------------- */
  function close() {
    lightbox.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  /* ---- Navigate ---------------------------------------------- */
  function prev() { open(current - 1); }
  function next() { open(current + 1); }

  /* ---- Attach click to each gallery item --------------------- */
  items.forEach(function (item, index) {
    var img = item.querySelector('.gallery__img');
    if (!img || !img.src || img.src.endsWith('/')) return;

    item.style.cursor = 'zoom-in';
    item.addEventListener('click', function () { open(index); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(index);
      }
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View ' + (img.alt || 'photo'));
  });

  /* ---- Lightbox controls ------------------------------------- */
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  prev);
  lbNext.addEventListener('click',  next);

  // Close on backdrop click (not on image or buttons)
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) close();
  });

  /* ---- Keyboard ---------------------------------------------- */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  /* ---- Touch swipe ------------------------------------------- */
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  }, { passive: true });

})();
