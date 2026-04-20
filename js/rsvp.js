/* ================================================================
   rsvp.js — RSVP form validation and POST to Google Apps Script

   SETUP:
   1. Deploy your Code.gs as a Web App (see Code.gs)
   2. Replace SCRIPT_URL below with your deployment URL
   ================================================================ */

(function () {
  'use strict';

  /* ---- Replace with your Google Apps Script Web App URL ------- */
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwXUDcJte4F3d5I4FSgE1hY9qui3hSNW9s1gBkvfbstIQmqaS1vbRVE8Qe-5h5nJwCfA/exec';

  var form            = document.getElementById('rsvpForm');
  var successEl       = document.getElementById('rsvpSuccess');
  var submitBtn       = document.getElementById('rsvpSubmit');
  var attendingSelect = document.getElementById('attending');
  var guestGroup      = document.getElementById('guestCountGroup');

  /* ---- Show/hide guest count based on attending answer -------- */
  if (attendingSelect && guestGroup) {
    attendingSelect.addEventListener('change', function () {
      if (attendingSelect.value === 'yes') {
        guestGroup.classList.add('visible');
        document.getElementById('guestCount').required = true;
      } else {
        guestGroup.classList.remove('visible');
        document.getElementById('guestCount').required = false;
        clearError('guestCount');
      }
    });
  }

  /* ---- Validation helpers ------------------------------------- */
  function fieldById(id) {
    return document.getElementById(id);
  }

  function errorById(id) {
    return document.getElementById(id + 'Error');
  }

  function setError(id, msg) {
    var field = fieldById(id);
    var errEl = errorById(id);
    if (field) field.classList.add('error');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(id) {
    var field = fieldById(id);
    var errEl = errorById(id);
    if (field) field.classList.remove('error');
    if (errEl) errEl.textContent = '';
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function validate() {
    var ok = true;

    // First name
    var fn = fieldById('firstName');
    if (!fn || !fn.value.trim()) {
      setError('firstName', 'Please enter your first name.');
      ok = false;
    } else {
      clearError('firstName');
    }

    // Last name
    var ln = fieldById('lastName');
    if (!ln || !ln.value.trim()) {
      setError('lastName', 'Please enter your last name.');
      ok = false;
    } else {
      clearError('lastName');
    }

    // Email
    var em = fieldById('email');
    if (!em || !em.value.trim()) {
      setError('email', 'Please enter your email address.');
      ok = false;
    } else if (!validateEmail(em.value.trim())) {
      setError('email', 'Please enter a valid email address.');
      ok = false;
    } else {
      clearError('email');
    }

    // Attending
    var att = fieldById('attending');
    if (!att || !att.value) {
      setError('attending', 'Please let us know if you can attend.');
      ok = false;
    } else {
      clearError('attending');
    }

    // Guest count (only required when attending)
    if (att && att.value === 'yes') {
      var gc = fieldById('guestCount');
      if (!gc || !gc.value) {
        setError('guestCount', 'Please select the number of guests.');
        ok = false;
      } else {
        clearError('guestCount');
      }
    }

    return ok;
  }

  /* ---- Clear errors on input ---------------------------------- */
  ['firstName','lastName','email','phone','attending','guestCount','dietary','message']
    .forEach(function (id) {
      var el = fieldById(id);
      if (el) {
        el.addEventListener('input', function ()  { clearError(id); });
        el.addEventListener('change', function () { clearError(id); });
      }
    });

  /* ---- Build form data object --------------------------------- */
  function collectData() {
    return {
      action:       'submitRSVP',
      firstName:    (fieldById('firstName')  || {}).value  || '',
      lastName:     (fieldById('lastName')   || {}).value  || '',
      email:        (fieldById('email')      || {}).value  || '',
      phone:        (fieldById('phone')      || {}).value  || '',
      attending:    (fieldById('attending')  || {}).value  || '',
      guestCount:   (fieldById('guestCount') || {}).value  || '',
      dietary:      (fieldById('dietary')    || {}).value  || '',
      message:      (fieldById('message')    || {}).value  || '',
      timestamp:    new Date().toISOString()
    };
  }

  /* ---- Submit handler ---------------------------------------- */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validate()) {
        // Scroll to first error
        var firstErr = form.querySelector('.error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      var data = collectData();

      // GAS web apps redirect POST requests, which drops CORS headers.
      // mode: 'no-cors' avoids the CORS error; the response is opaque
      // (status 0, body unreadable) but the data still reaches the sheet.
      fetch(SCRIPT_URL, {
        method: 'POST',
        mode:   'no-cors',
        body:   JSON.stringify(data)
      })
        .then(function () {
          // With no-cors any completed fetch (opaque) is treated as success
          showSuccess();
        })
        .catch(function (err) {
          console.error('RSVP submit error:', err);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send My RSVP';
          alert(
            'Something went wrong. Please try again or contact Slindo Phiri on 064 338 1780.'
          );
        });
    });
  }

  function showSuccess() {
    if (form) form.style.display = 'none';
    if (successEl) successEl.classList.add('show');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

})();
