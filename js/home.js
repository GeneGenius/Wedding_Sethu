/* ================================================================
   home.js — Hero slider (5 slides, 5 s interval) + Countdown timer
   ================================================================ */

(function () {
  'use strict';

  /* ================================================================
     HERO SLIDER
     ================================================================ */
  var SLIDE_INTERVAL = 5000; // 5 seconds

  var slides     = Array.from(document.querySelectorAll('.hero__slide'));
  var dots       = Array.from(document.querySelectorAll('.hero__dot'));
  var current    = 0;
  var timer      = null;
  var paused     = false;

  function goTo(index) {
    if (index === current) return;

    // Deactivate current
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    // Activate next
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function next() {
    goTo(current + 1);
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(next, SLIDE_INTERVAL);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  if (slides.length > 0) {
    // Dot click handlers
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        goTo(idx);
        stopTimer();
        startTimer(); // restart interval on manual nav
      });
    });

    // Pause on hover / focus for accessibility
    var hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mouseenter', function () { paused = true;  stopTimer(); });
      hero.addEventListener('mouseleave', function () { paused = false; startTimer(); });
      hero.addEventListener('focusin',    function () { paused = true;  stopTimer(); });
      hero.addEventListener('focusout',   function () { paused = false; startTimer(); });
    }

    startTimer();
  }

  /* ================================================================
     COUNTDOWN TIMER
     Target: 26 September 2026, 10:00 AM (South African time UTC+2)
     ================================================================ */
  var TARGET = new Date('2026-09-26T10:00:00+02:00').getTime();

  var elDays    = document.getElementById('cdDays');
  var elHours   = document.getElementById('cdHours');
  var elMinutes = document.getElementById('cdMinutes');
  var elSeconds = document.getElementById('cdSeconds');

  function pad(n, width) {
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

  function tick() {
    var now  = Date.now();
    var diff = TARGET - now;

    if (diff <= 0) {
      // Wedding day!
      if (elDays)    elDays.textContent    = '000';
      if (elHours)   elHours.textContent   = '00';
      if (elMinutes) elMinutes.textContent = '00';
      if (elSeconds) elSeconds.textContent = '00';
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days    = Math.floor(totalSeconds / 86400);
    var hours   = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (elDays)    elDays.textContent    = pad(days, 3);
    if (elHours)   elHours.textContent   = pad(hours, 2);
    if (elMinutes) elMinutes.textContent = pad(minutes, 2);
    if (elSeconds) elSeconds.textContent = pad(seconds, 2);
  }

  if (elDays || elHours || elMinutes || elSeconds) {
    tick();
    setInterval(tick, 1000);
  }

})();
