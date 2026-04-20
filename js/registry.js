/* ================================================================
   registry.js — Fetches items from Google Apps Script and renders
   registry cards. Handles "Mark as Purchased" action.

   SETUP:
   1. Deploy your Code.gs as a Web App (see Code.gs for instructions)
   2. Replace the SCRIPT_URL value below with your deployment URL
   ================================================================ */

(function () {
  'use strict';

  /* ---- Replace with your Google Apps Script Web App URL ------- */
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwXUDcJte4F3d5I4FSgE1hY9qui3hSNW9s1gBkvfbstIQmqaS1vbRVE8Qe-5h5nJwCfA/exec';

  var statusEl = document.getElementById('registryStatus');
  var gridEl   = document.getElementById('registryGrid');

  /* ---- Helpers ------------------------------------------------ */
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function hideStatus() {
    if (statusEl) statusEl.style.display = 'none';
  }

  function formatPrice(price) {
    if (!price && price !== 0) return '';
    var num = parseFloat(price);
    if (isNaN(num)) return price; // return as-is if not a number
    return 'R ' + num.toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /* ---- Render a single registry card -------------------------- */
  function renderCard(item) {
    var purchased = String(item.purchased).toLowerCase() === 'true';

    var card = document.createElement('div');
    card.className = 'registry__card' + (purchased ? ' purchased' : '');
    card.setAttribute('data-id', item.id);

    var inner = '';

    if (purchased) {
      inner += '<span class="purchased-badge">Purchased</span>';
    }

    if (item.category) {
      inner += '<p class="registry__category">'
        + escHtml(item.category) + '</p>';
    }

    inner += '<h3 class="registry__name">'
      + escHtml(item.name || 'Gift') + '</h3>';

    if (item.description) {
      inner += '<p class="registry__description">'
        + escHtml(item.description) + '</p>';
    }

    if (item.price !== undefined && item.price !== '') {
      inner += '<p class="registry__price">'
        + escHtml(formatPrice(item.price)) + '</p>';
    }

    inner += '<button class="registry__btn"'
      + (purchased ? ' disabled aria-disabled="true"' : '')
      + ' data-id="' + escHtml(String(item.id)) + '">'
      + (purchased ? 'Already Purchased' : 'Mark as Purchased')
      + '</button>';

    card.innerHTML = inner;

    // Attach click handler to button (only if not purchased)
    if (!purchased) {
      var btn = card.querySelector('.registry__btn');
      btn.addEventListener('click', function () {
        handlePurchase(item.id, card, btn);
      });
    }

    return card;
  }

  /* ---- Handle "Mark as Purchased" ----------------------------- */
  function handlePurchase(id, card, btn) {
    btn.disabled = true;
    btn.textContent = 'Updating…';

    var url = SCRIPT_URL + '?action=markPurchased&id=' + encodeURIComponent(id);

    // GAS GET redirects can also drop CORS headers — use no-cors and
    // treat a completed fetch as success (item is marked on the sheet).
    fetch(url, { mode: 'no-cors' })
      .then(function () {
        card.classList.add('purchased');

        var badge = document.createElement('span');
        badge.className = 'purchased-badge';
        badge.textContent = 'Purchased';
        card.insertBefore(badge, card.firstChild);

        btn.textContent = 'Already Purchased';
        btn.setAttribute('aria-disabled', 'true');
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Mark as Purchased';
        alert('An error occurred. Please check your connection and try again.');
      });
  }

  /* ---- Escape HTML to prevent XSS ---------------------------- */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---- Fetch registry items ---------------------------------- */
  function loadRegistry() {
    if (!gridEl) return;

    setStatus('Loading registry items…');

    var url = SCRIPT_URL + '?action=getItems';

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        hideStatus();

        var items = Array.isArray(data) ? data : (data.items || []);

        if (items.length === 0) {
          setStatus('No registry items found yet — check back soon!');
          if (statusEl) statusEl.style.display = 'block';
          return;
        }

        var fragment = document.createDocumentFragment();
        items.forEach(function (item) {
          fragment.appendChild(renderCard(item));
        });
        gridEl.appendChild(fragment);
      })
      .catch(function (err) {
        console.error('Registry fetch error:', err);
        setStatus(
          'Unable to load registry at this time. '
          + 'Please contact Slindo Phiri on 064 338 1780 for assistance.'
        );
        if (statusEl) statusEl.style.display = 'block';
      });
  }

  /* ---- Boot -------------------------------------------------- */
  if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    // Demo mode — show sample cards so the page looks correct before setup
    setStatus('');
    hideStatus();
    var demoItems = [
      {
        id: '1',
        name: 'Kitchen Stand Mixer',
        category: 'Kitchen',
        description: 'A versatile stand mixer to make our kitchen adventures easy and fun.',
        price: 4999,
        purchased: false
      },
      {
        id: '2',
        name: 'Bed Linen Set — King',
        category: 'Bedroom',
        description: 'Premium Egyptian cotton sheets (1000 thread count) in ivory white.',
        price: 2800,
        purchased: false
      },
      {
        id: '3',
        name: 'Dinner Service Set (12 pax)',
        category: 'Dining',
        description: 'Classic white porcelain dinner set to host family gatherings.',
        price: 3200,
        purchased: true
      },
      {
        id: '4',
        name: 'Espresso Coffee Machine',
        category: 'Kitchen',
        description: 'Bean-to-cup espresso machine for our morning rituals.',
        price: 6500,
        purchased: false
      },
      {
        id: '5',
        name: 'Garden Braai Set',
        category: 'Outdoor',
        description: 'Weber kettle grill and accessories for weekend braais with the family.',
        price: 3800,
        purchased: false
      },
      {
        id: '6',
        name: 'Wall Art — Abstract Canvas',
        category: 'Home Decor',
        description: 'A statement piece for our living room in warm earth tones.',
        price: 1800,
        purchased: false
      }
    ];
    var fragment = document.createDocumentFragment();
    demoItems.forEach(function (item) {
      fragment.appendChild(renderCard(item));
    });
    if (gridEl) gridEl.appendChild(fragment);
  } else {
    loadRegistry();
  }

})();
