/**
 * Bulevar.IT — Cookie Consent Banner (GTM Consent Mode v2 + Meta Pixel + SalesIQ)
 * Bez eksternih biblioteka. Čuva izbor 12 meseci u localStorage ('bulevar_consent').
 */
(function () {
  'use strict';

  var PRIVACY_URL = '/politika-privatnosti';
  var STORAGE_KEY = 'bulevar_consent';
  var TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  // 1) Podrazumevano sve odbijeno (Consent Mode v2 denied) pre GTM i Meta Pixel-a
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      var ts = Number(parsed.timestamp || parsed.ts || 0);
      if (!ts || Date.now() - ts > TWELVE_MONTHS_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return {
        analytics: !!parsed.analytics,
        marketing: !!parsed.marketing,
        timestamp: ts
      };
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics, marketing) {
    var payload = {
      necessary: true,
      analytics: !!analytics,
      marketing: !!marketing,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
    return payload;
  }

  function applyMetaPixelConsent(marketingGranted) {
    if (typeof window.fbq === 'function') {
      try {
        window.fbq('consent', marketingGranted ? 'grant' : 'revoke');
      } catch (e) {}
    }
  }

  function applySalesIQConsent(analyticsGranted) {
    if (!analyticsGranted && window.$zoho && window.$zoho.salesiq) {
      try {
        if (window.$zoho.salesiq.floatwindow) {
          window.$zoho.salesiq.floatwindow.visible('hide');
        }
        if (window.$zoho.salesiq.floatbutton) {
          window.$zoho.salesiq.floatbutton.visible('hide');
        }
      } catch (e) {}
    }
  }

  function updateConsentEngine(analytics, marketing, eventName) {
    var aState = analytics ? 'granted' : 'denied';
    var mState = marketing ? 'granted' : 'denied';

    gtag('consent', 'update', {
      analytics_storage: aState,
      functionality_storage: aState,
      personalization_storage: aState,
      ad_storage: mState,
      ad_user_data: mState,
      ad_personalization: mState
    });

    applyMetaPixelConsent(!!marketing);
    applySalesIQConsent(!!analytics);

    window.dataLayer.push({
      event: eventName,
      consent_analytics: aState,
      consent_marketing: mState
    });
  }

  // 2) Ako posetilac već ima sačuvan izbor, odmah ažuriraj Consent Mode i pošalji consent_loaded
  var existingConsent = readConsent();
  if (existingConsent) {
    updateConsentEngine(existingConsent.analytics, existingConsent.marketing, 'consent_loaded');
    // Pošto se Meta Pixel skripta u <head> izvršava odmah nakon cookie-consent.js i poziva fbq('consent', 'revoke'),
    // osiguravamo da se za postojeću saglasnost pozove fbq('consent', 'grant') čim se fbq inicijalizuje.
    var syncFbq = function () {
      applyMetaPixelConsent(existingConsent.marketing);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', syncFbq, { once: true });
    } else {
      setTimeout(syncFbq, 0);
    }
  }

  // 3) Tekstovi (SR / EN)
  var COPY = {
    sr: {
      title: 'Kolačići i privatnost',
      desc: 'Koristimo kolačiće za analitiku posete, chat podršku i merenje oglasa.',
      more: 'Saznajte više',
      accept: 'Prihvatam',
      necessaryOnly: 'Samo neophodni',
      settingsLink: 'Podešavanja',
      saveSettings: 'Sačuvaj izbor',
      catNecessary: 'Neophodni',
      catNecessarySub: 'Uvek uključeni · rad sajta i čuvanje izbora',
      catAnalytics: 'Analitika',
      catAnalyticsSub: 'GA4, Clarity, SalesIQ',
      catMarketing: 'Marketing',
      catMarketingSub: 'Meta Pixel'
    },
    en: {
      title: 'Cookies & Privacy',
      desc: 'We use cookies for traffic analytics, live chat support, and ad measurement.',
      more: 'Learn more',
      accept: 'Accept all',
      necessaryOnly: 'Necessary only',
      settingsLink: 'Settings',
      saveSettings: 'Save preferences',
      catNecessary: 'Necessary',
      catNecessarySub: 'Always active · core site functionality',
      catAnalytics: 'Analytics',
      catAnalyticsSub: 'GA4, Clarity, SalesIQ',
      catMarketing: 'Marketing',
      catMarketingSub: 'Meta Pixel'
    }
  };

  function getLang() {
    try {
      var saved = localStorage.getItem('bulevar_lang');
      if (saved === 'en') return 'en';
    } catch (e) {}
    var htmlLang = (document.documentElement && document.documentElement.lang) || '';
    return htmlLang.toLowerCase().indexOf('en') === 0 ? 'en' : 'sr';
  }

  // 4) UI Banner & Styles
  var bannerEl = null;
  var chkAnalytics = null;
  var chkMarketing = null;
  var detailsWrap = null;
  var settingsBtn = null;

  function injectStyles() {
    if (document.getElementById('bulevar-cc-styles')) return;
    var style = document.createElement('style');
    style.id = 'bulevar-cc-styles';
    style.textContent = [
      '#bulevar-cc {',
      '  position: fixed;',
      '  left: 24px;',
      '  bottom: 24px;',
      '  z-index: 99999;',
      '  width: calc(100vw - 48px);',
      '  max-width: 420px;',
      '  background: #12192C;',
      '  color: #F4EFE6;',
      '  border: 1px solid rgba(217, 178, 95, 0.28);',
      '  border-radius: 18px;',
      '  padding: 20px 22px;',
      '  box-shadow: 0 22px 54px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.1);',
      '  font-family: inherit;',
      '  box-sizing: border-box;',
      '  transition: opacity 0.25s ease, transform 0.25s ease;',
      '}',
      '#bulevar-cc[hidden] {',
      '  display: none !important;',
      '}',
      '#bulevar-cc * {',
      '  box-sizing: border-box;',
      '}',
      '.bcc-head {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  margin-bottom: 8px;',
      '}',
      '.bcc-title {',
      '  margin: 0;',
      '  font-size: 15px;',
      '  font-weight: 700;',
      '  color: #F4EFE6;',
      '  letter-spacing: -0.01em;',
      '}',
      '.bcc-desc {',
      '  margin: 0 0 16px;',
      '  font-size: 13.5px;',
      '  line-height: 1.55;',
      '  color: rgba(244, 239, 230, 0.84);',
      '}',
      '.bcc-more {',
      '  color: #D9B25F;',
      '  text-decoration: underline;',
      '  text-underline-offset: 3px;',
      '  font-weight: 600;',
      '  margin-left: 5px;',
      '  white-space: nowrap;',
      '}',
      '.bcc-more:hover {',
      '  color: #e6c677;',
      '}',
      '.bcc-btns {',
      '  display: grid;',
      '  grid-template-columns: 1fr 1fr;',
      '  gap: 10px;',
      '}',
      '.bcc-btn {',
      '  appearance: none;',
      '  -webkit-appearance: none;',
      '  display: inline-flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  min-height: 42px;',
      '  padding: 10px 14px;',
      '  border-radius: 999px;',
      '  font-family: inherit;',
      '  font-size: 13px;',
      '  font-weight: 700;',
      '  cursor: pointer;',
      '  text-align: center;',
      '  transition: transform 0.18s ease, background 0.2s ease, border-color 0.2s ease;',
      '}',
      '.bcc-btn:active {',
      '  transform: scale(0.98);',
      '}',
      '.bcc-btn--accept {',
      '  background: #D9B25F;',
      '  color: #12192C;',
      '  border: 1px solid #D9B25F;',
      '}',
      '.bcc-btn--accept:hover {',
      '  background: #e5c16f;',
      '  border-color: #e5c16f;',
      '}',
      '.bcc-btn--reject {',
      '  background: rgba(244, 239, 230, 0.06);',
      '  color: #F4EFE6;',
      '  border: 1px solid rgba(244, 239, 230, 0.26);',
      '}',
      '.bcc-btn--reject:hover {',
      '  background: rgba(244, 239, 230, 0.12);',
      '  border-color: rgba(244, 239, 230, 0.45);',
      '}',
      '.bcc-foot {',
      '  margin-top: 12px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '}',
      '.bcc-link-btn {',
      '  background: none;',
      '  border: none;',
      '  padding: 2px 6px;',
      '  font-family: inherit;',
      '  font-size: 12.5px;',
      '  font-weight: 600;',
      '  color: #D9B25F;',
      '  cursor: pointer;',
      '  text-decoration: underline;',
      '  text-underline-offset: 3px;',
      '}',
      '.bcc-link-btn:hover {',
      '  color: #e6c677;',
      '}',
      '.bcc-settings {',
      '  margin-top: 14px;',
      '  padding-top: 14px;',
      '  border-top: 1px solid rgba(244, 239, 230, 0.12);',
      '  display: none;',
      '  flex-direction: column;',
      '  gap: 10px;',
      '}',
      '.bcc-settings.is-open {',
      '  display: flex;',
      '}',
      '.bcc-cat {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  gap: 12px;',
      '  padding: 8px 10px;',
      '  border-radius: 10px;',
      '  background: rgba(255, 255, 255, 0.03);',
      '  border: 1px solid rgba(244, 239, 230, 0.08);',
      '}',
      '.bcc-cat-info {',
      '  display: flex;',
      '  flex-direction: column;',
      '  gap: 2px;',
      '}',
      '.bcc-cat-name {',
      '  font-size: 13px;',
      '  font-weight: 600;',
      '  color: #F4EFE6;',
      '}',
      '.bcc-cat-sub {',
      '  font-size: 11.5px;',
      '  color: rgba(244, 239, 230, 0.65);',
      '}',
      '.bcc-switch {',
      '  position: relative;',
      '  display: inline-block;',
      '  width: 40px;',
      '  height: 22px;',
      '  flex-shrink: 0;',
      '}',
      '.bcc-switch input {',
      '  opacity: 0;',
      '  width: 0;',
      '  height: 0;',
      '}',
      '.bcc-slider {',
      '  position: absolute;',
      '  cursor: pointer;',
      '  inset: 0;',
      '  background-color: rgba(244, 239, 230, 0.2);',
      '  border-radius: 999px;',
      '  transition: background-color 0.2s ease;',
      '}',
      '.bcc-slider::before {',
      '  content: "";',
      '  position: absolute;',
      '  height: 16px;',
      '  width: 16px;',
      '  left: 3px;',
      '  bottom: 3px;',
      '  background-color: #F4EFE6;',
      '  border-radius: 50%;',
      '  transition: transform 0.2s ease, background-color 0.2s ease;',
      '}',
      '.bcc-switch input:checked + .bcc-slider {',
      '  background-color: #D9B25F;',
      '}',
      '.bcc-switch input:checked + .bcc-slider::before {',
      '  transform: translateX(18px);',
      '  background-color: #12192C;',
      '}',
      '.bcc-switch input:disabled + .bcc-slider {',
      '  opacity: 0.6;',
      '  cursor: not-allowed;',
      '}',
      '.bcc-save {',
      '  margin-top: 4px;',
      '  width: 100%;',
      '}',
      '@media (max-width: 640px) {',
      '  #bulevar-cc {',
      '    left: 0;',
      '    right: 0;',
      '    bottom: 0;',
      '    width: 100%;',
      '    max-width: 100%;',
      '    border-radius: 18px 18px 0 0;',
      '    border-left: none;',
      '    border-right: none;',
      '    border-bottom: none;',
      '    padding: 18px 16px calc(18px + env(safe-area-inset-bottom, 0px));',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function buildBanner() {
    if (bannerEl) return bannerEl;
    injectStyles();

    var c = COPY[getLang()] || COPY.sr;
    bannerEl = document.createElement('div');
    bannerEl.id = 'bulevar-cc';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-live', 'polite');
    bannerEl.setAttribute('aria-label', c.title);
    bannerEl.setAttribute('data-lenis-prevent', 'true');
    bannerEl.hidden = true;

    bannerEl.innerHTML = [
      '<div class="bcc-head">',
      '  <p class="bcc-title" data-bcc="title"></p>',
      '</div>',
      '<p class="bcc-desc">',
      '  <span data-bcc="desc"></span>',
      '  <a class="bcc-more" href="' + PRIVACY_URL + '" data-bcc="more"></a>',
      '</p>',
      '<div class="bcc-btns">',
      '  <button type="button" class="bcc-btn bcc-btn--accept" data-bcc-action="accept" data-bcc="accept"></button>',
      '  <button type="button" class="bcc-btn bcc-btn--reject" data-bcc-action="reject" data-bcc="necessaryOnly"></button>',
      '</div>',
      '<div class="bcc-foot">',
      '  <button type="button" class="bcc-link-btn" data-bcc-action="toggle-settings" aria-expanded="false" data-bcc="settingsLink"></button>',
      '</div>',
      '<div class="bcc-settings" id="bcc-settings-panel">',
      '  <div class="bcc-cat">',
      '    <div class="bcc-cat-info">',
      '      <span class="bcc-cat-name" data-bcc="catNecessary"></span>',
      '      <span class="bcc-cat-sub" data-bcc="catNecessarySub"></span>',
      '    </div>',
      '    <label class="bcc-switch">',
      '      <input type="checkbox" checked disabled aria-label="Neophodni" />',
      '      <span class="bcc-slider"></span>',
      '    </label>',
      '  </div>',
      '  <div class="bcc-cat">',
      '    <div class="bcc-cat-info">',
      '      <span class="bcc-cat-name" data-bcc="catAnalytics"></span>',
      '      <span class="bcc-cat-sub" data-bcc="catAnalyticsSub"></span>',
      '    </div>',
      '    <label class="bcc-switch">',
      '      <input type="checkbox" id="bcc-chk-analytics" aria-label="Analitika" />',
      '      <span class="bcc-slider"></span>',
      '    </label>',
      '  </div>',
      '  <div class="bcc-cat">',
      '    <div class="bcc-cat-info">',
      '      <span class="bcc-cat-name" data-bcc="catMarketing"></span>',
      '      <span class="bcc-cat-sub" data-bcc="catMarketingSub"></span>',
      '    </div>',
      '    <label class="bcc-switch">',
      '      <input type="checkbox" id="bcc-chk-marketing" aria-label="Marketing" />',
      '      <span class="bcc-slider"></span>',
      '    </label>',
      '  </div>',
      '  <button type="button" class="bcc-btn bcc-btn--accept bcc-save" data-bcc-action="save" data-bcc="saveSettings"></button>',
      '</div>'
    ].join('\n');

    document.body.appendChild(bannerEl);

    chkAnalytics = bannerEl.querySelector('#bcc-chk-analytics');
    chkMarketing = bannerEl.querySelector('#bcc-chk-marketing');
    detailsWrap = bannerEl.querySelector('#bcc-settings-panel');
    settingsBtn = bannerEl.querySelector('[data-bcc-action="toggle-settings"]');

    updateBannerCopy();

    bannerEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-bcc-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-bcc-action');
      if (action === 'accept') {
        handleChoice(true, true);
      } else if (action === 'reject') {
        handleChoice(false, false);
      } else if (action === 'save') {
        handleChoice(!!(chkAnalytics && chkAnalytics.checked), !!(chkMarketing && chkMarketing.checked));
      } else if (action === 'toggle-settings') {
        if (!detailsWrap) return;
        var open = detailsWrap.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });

    return bannerEl;
  }

  function updateBannerCopy() {
    if (!bannerEl) return;
    var c = COPY[getLang()] || COPY.sr;
    bannerEl.setAttribute('aria-label', c.title);
    var nodes = bannerEl.querySelectorAll('[data-bcc]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-bcc');
      if (c[key]) nodes[i].textContent = c[key];
    }
  }

  function handleChoice(analytics, marketing) {
    writeConsent(analytics, marketing);
    updateConsentEngine(analytics, marketing, 'consent_update');
    closeBanner();
  }

  function openBanner(expandSettings) {
    if (!document.body) return;
    buildBanner();
    updateBannerCopy();
    var saved = readConsent();
    if (chkAnalytics) chkAnalytics.checked = saved ? !!saved.analytics : false;
    if (chkMarketing) chkMarketing.checked = saved ? !!saved.marketing : false;
    if (detailsWrap) {
      detailsWrap.classList.toggle('is-open', !!expandSettings);
      if (settingsBtn) settingsBtn.setAttribute('aria-expanded', expandSettings ? 'true' : 'false');
    }
    bannerEl.hidden = false;
  }

  function closeBanner() {
    if (bannerEl) {
      bannerEl.hidden = true;
    }
  }

  window.addEventListener('bulevar:langchange', updateBannerCopy);

  // 5) Globalni API za otvaranje iz futera (bulevarCookies.open())
  window.bulevarCookies = {
    open: function () {
      openBanner(false);
    },
    close: closeBanner,
    acceptAll: function () {
      handleChoice(true, true);
    },
    rejectAll: function () {
      handleChoice(false, false);
    },
    get: readConsent
  };

  // 6) Prikaz na prvom ulasku
  function initOnDom() {
    if (!readConsent()) {
      openBanner(false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnDom, { once: true });
  } else {
    initOnDom();
  }
})();
