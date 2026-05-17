/**
 * Email Capture Widget — Bartact Affiliate Network
 *
 * Usage (add to your page before </body>):
 *   <script
 *     src="email-capture.js"
 *     data-variants="sticky,popup,inline"
 *     data-endpoint="/api/subscribe"
 *     data-source-site="my-affiliate-site"
 *   ></script>
 *
 * data-variants: comma-separated list of: sticky, popup, inline
 * data-endpoint:  POST URL (default: /api/subscribe)
 * data-source-site: identifier sent with each submission
 */
(function () {
  'use strict';

  /* ── Config from script tag ─────────────────────────────── */
  var scriptTag = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

  var ENDPOINT    = scriptTag.getAttribute('data-endpoint')    || '/api/subscribe';
  var SOURCE_SITE = scriptTag.getAttribute('data-source-site') || window.location.hostname;
  var rawVariants = scriptTag.getAttribute('data-variants')    || 'sticky,popup,inline';
  var VARIANTS    = rawVariants.split(',').map(function (v) { return v.trim(); });

  var STORAGE_KEY_STICKY  = 'ec_sticky_dismissed';
  var STORAGE_KEY_POPUP   = 'ec_popup_dismissed';
  var STORAGE_KEY_INLINE  = 'ec_inline_dismissed';
  var DISMISS_TTL_MS      = 7 * 24 * 60 * 60 * 1000; // 7 days

  /* ── Helpers ────────────────────────────────────────────── */
  function isDismissed(key) {
    try {
      var val = localStorage.getItem(key);
      if (!val) return false;
      var data = JSON.parse(val);
      return Date.now() < data.expires;
    } catch (e) { return false; }
  }

  function setDismissed(key) {
    try {
      localStorage.setItem(key, JSON.stringify({ expires: Date.now() + DISMISS_TTL_MS }));
    } catch (e) {}
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function submitEmail(email, signupType, onSuccess, onError) {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        source_site: SOURCE_SITE,
        signup_type: signupType
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) { onSuccess(); }
        else { onError(data.error || 'Something went wrong.'); }
      })
      .catch(function () { onError('Network error. Please try again.'); });
  }

  function showSuccess(form, successEl) {
    form.style.display = 'none';
    successEl.style.display = 'block';
  }

  function markInputError(input, show) {
    if (show) {
      input.classList.add('ec-error');
    } else {
      input.classList.remove('ec-error');
    }
  }


  /* ── Sticky Bottom Bar ──────────────────────────────────── */
  function initStickyBar() {
    if (isDismissed(STORAGE_KEY_STICKY)) return;

    var bar = document.createElement('div');
    bar.id = 'ec-sticky-bar';
    bar.className = 'ec-widget';
    bar.setAttribute('role', 'complementary');
    bar.setAttribute('aria-label', 'Email signup offer');
    bar.innerHTML =
      '<p class="ec-bar-text">Get <span>exclusive deals</span> on Jeep and truck accessories</p>' +
      '<form class="ec-bar-form" novalidate>' +
        '<input class="ec-input" type="email" placeholder="your@email.com" aria-label="Email address" autocomplete="email" />' +
        '<button class="ec-btn" type="submit">Get Deals</button>' +
      '</form>' +
      '<p class="ec-success-msg" aria-live="polite">You\'re in! Check your inbox.</p>' +
      '<button class="ec-close" type="button" aria-label="Close signup bar">&times;</button>';

    document.body.appendChild(bar);

    var form       = bar.querySelector('.ec-bar-form');
    var input      = bar.querySelector('.ec-input');
    var successMsg = bar.querySelector('.ec-success-msg');
    var closeBtn   = bar.querySelector('.ec-close');

    // Show after 5 seconds
    setTimeout(function () {
      bar.classList.add('ec-visible');
    }, 5000);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      markInputError(input, false);
      if (!validateEmail(input.value)) {
        markInputError(input, true);
        input.focus();
        return;
      }
      submitEmail(input.value, 'sticky_bar',
        function () {
          showSuccess(form, successMsg);
          setDismissed(STORAGE_KEY_STICKY);
          setTimeout(function () { bar.classList.remove('ec-visible'); }, 3000);
        },
        function (msg) {
          markInputError(input, true);
          console.warn('[EC] Sticky bar error:', msg);
        }
      );
    });

    closeBtn.addEventListener('click', function () {
      bar.classList.remove('ec-visible');
      setDismissed(STORAGE_KEY_STICKY);
    });
  }


  /* ── Exit-Intent Popup ──────────────────────────────────── */
  function initExitPopup() {
    if (isDismissed(STORAGE_KEY_POPUP)) return;

    var overlay = document.createElement('div');
    overlay.id = 'ec-popup-overlay';
    overlay.className = 'ec-widget';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ec-popup-headline');
    overlay.innerHTML =
      '<div id="ec-popup">' +
        '<button class="ec-popup-close" type="button" aria-label="Close popup">&times;</button>' +
        '<p class="ec-popup-eyebrow">Wait — don\'t go!</p>' +
        '<h2 class="ec-popup-headline" id="ec-popup-headline">Get our weekly deals + <span style="color:#f0a500">10% off Bartact</span></h2>' +
        '<p class="ec-popup-sub">Join thousands of Jeep and truck owners getting the best deals delivered every week. <strong>One-click unsubscribe</strong> anytime.</p>' +
        '<form class="ec-popup-form" novalidate>' +
          '<input class="ec-input" type="email" placeholder="your@email.com" aria-label="Email address" autocomplete="email" />' +
          '<button class="ec-btn" type="submit">Yes, Send Me Deals</button>' +
          '<button class="ec-popup-dismiss" type="button">No thanks, I\'ll pay full price</button>' +
        '</form>' +
        '<p class="ec-success-msg" aria-live="polite">You\'re in! Check your inbox for your 10% off code.</p>' +
      '</div>';

    document.body.appendChild(overlay);

    var popup      = overlay.querySelector('#ec-popup');
    var form       = overlay.querySelector('.ec-popup-form');
    var input      = overlay.querySelector('.ec-input');
    var successMsg = overlay.querySelector('.ec-success-msg');
    var closeBtn   = overlay.querySelector('.ec-popup-close');
    var dismissBtn = overlay.querySelector('.ec-popup-dismiss');
    var triggered  = false;

    function openPopup() {
      if (triggered || isDismissed(STORAGE_KEY_POPUP)) return;
      triggered = true;
      overlay.classList.add('ec-visible');
      input.focus();
    }

    function closePopup() {
      overlay.classList.remove('ec-visible');
      setDismissed(STORAGE_KEY_POPUP);
    }

    // Exit intent: mouse leaves viewport through top
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 0) { openPopup(); }
    });

    // Close on overlay background click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { closePopup(); }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('ec-visible')) {
        closePopup();
      }
    });

    closeBtn.addEventListener('click', closePopup);
    dismissBtn.addEventListener('click', closePopup);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      markInputError(input, false);
      if (!validateEmail(input.value)) {
        markInputError(input, true);
        input.focus();
        return;
      }
      submitEmail(input.value, 'exit_popup',
        function () {
          showSuccess(form, successMsg);
          setDismissed(STORAGE_KEY_POPUP);
          setTimeout(closePopup, 3500);
        },
        function (msg) {
          markInputError(input, true);
          console.warn('[EC] Popup error:', msg);
        }
      );
    });
  }


  /* ── Inline Signup Form ─────────────────────────────────── */
  function initInlineForms() {
    if (isDismissed(STORAGE_KEY_INLINE)) return;

    // Find all placeholder elements: <div data-ec-inline></div>
    // OR auto-inject after every Nth product card if placeholders not present
    var placeholders = document.querySelectorAll('[data-ec-inline]');

    function buildInlineBlock(container) {
      container.className = 'ec-inline-block ec-widget';
      container.setAttribute('role', 'complementary');
      container.setAttribute('aria-label', 'Personalized recommendations signup');
      container.innerHTML =
        '<p class="ec-inline-eyebrow">Personalized for you</p>' +
        '<h3 class="ec-inline-headline">Want personalized recommendations?</h3>' +
        '<p class="ec-inline-sub">Tell us your email and we\'ll send picks matched to your rig — plus member-only pricing.</p>' +
        '<form class="ec-inline-form" novalidate>' +
          '<input class="ec-input" type="email" placeholder="your@email.com" aria-label="Email address" autocomplete="email" />' +
          '<button class="ec-btn" type="submit">Get Picks</button>' +
        '</form>' +
        '<p class="ec-success-msg" aria-live="polite">Done! Personalized picks coming your way.</p>' +
        '<p class="ec-privacy">No spam. Unsubscribe anytime.</p>';

      var form       = container.querySelector('.ec-inline-form');
      var input      = container.querySelector('.ec-input');
      var successMsg = container.querySelector('.ec-success-msg');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        markInputError(input, false);
        if (!validateEmail(input.value)) {
          markInputError(input, true);
          input.focus();
          return;
        }
        submitEmail(input.value, 'inline_form',
          function () {
            showSuccess(form, successMsg);
            setDismissed(STORAGE_KEY_INLINE);
            // Hide all other inline blocks after one signup
            document.querySelectorAll('.ec-inline-block').forEach(function (el) {
              if (el !== container) { el.style.display = 'none'; }
            });
          },
          function (msg) {
            markInputError(input, true);
            console.warn('[EC] Inline form error:', msg);
          }
        );
      });
    }

    if (placeholders.length > 0) {
      placeholders.forEach(buildInlineBlock);
    } else {
      // Auto-inject: find product card containers and insert after every 4th card
      var cardSelectors = [
        '.product-card', '.product-item', '.product-grid-item',
        '[data-product-id]', '.grid-product', '.product'
      ];
      var cards = [];
      for (var i = 0; i < cardSelectors.length; i++) {
        cards = Array.prototype.slice.call(document.querySelectorAll(cardSelectors[i]));
        if (cards.length >= 4) break;
      }
      if (cards.length >= 4) {
        var insertAfter = cards[3]; // after 4th card
        var block = document.createElement('div');
        insertAfter.parentNode.insertBefore(block, insertAfter.nextSibling);
        buildInlineBlock(block);
      }
    }
  }

  /* ── Init ───────────────────────────────────────────────── */
  function init() {
    if (VARIANTS.indexOf('sticky') !== -1)  { initStickyBar(); }
    if (VARIANTS.indexOf('popup')  !== -1)  { initExitPopup(); }
    if (VARIANTS.indexOf('inline') !== -1)  { initInlineForms(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
