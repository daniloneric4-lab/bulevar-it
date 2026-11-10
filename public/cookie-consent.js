/*!
 * Bulevar.IT — cookie consent (GA4 Consent Mode v2 + GTM + Meta Pixel + SalesIQ)
 * Fajl ide u: public/cookie-consent.js
 * U index.html: <script src="/cookie-consent.js"></script> NAJVIŠE u <head>, PRE GTM i Meta Pixel koda.
 */
(function () {
  var KEY = 'bulevar_consent';
  var VERSION = 1;
  var MAX_AGE_DAYS = 365;
  var PRIVACY_URL = '/politika-privatnosti';

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || v.v !== VERSION) return null;
      if (Date.now() - v.ts > MAX_AGE_DAYS * 864e5) return null;
      return v;
    } catch (e) { return null; }
  }
  function save(analytics, marketing) {
    var v = { v: VERSION, ts: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    return v;
  }
  function modeFor(c) {
    var a = c && c.analytics ? 'granted' : 'denied';
    var m = c && c.marketing ? 'granted' : 'denied';
    return {
      analytics_storage: a,
      ad_storage: m, ad_user_data: m, ad_personalization: m,
      functionality_storage: 'granted', security_storage: 'granted'
    };
  }

  // 1) Podrazumevano: sve odbijeno dok posetilac ne odluči (ili učitaj sačuvanu odluku)
  var saved = read();
  gtag('consent', 'default', Object.assign(modeFor(saved), { wait_for_update: 500 }));
  if (saved) {
    dataLayer.push({ event: 'consent_loaded', consent_analytics: saved.analytics, consent_marketing: saved.marketing });
  }

  function apply(c, fromClick) {
    gtag('consent', 'update', modeFor(c));
    if (window.fbq) fbq('consent', c.marketing ? 'grant' : 'revoke');
    if (fromClick) {
      dataLayer.push({ event: 'consent_update', consent_analytics: c.analytics, consent_marketing: c.marketing });
    }
  }
  // Meta Pixel se učitava kasnije u <head>; kad se učita, primeni sačuvanu odluku
  if (saved) {
    var tries = 0, t = setInterval(function () {
      if (window.fbq) { fbq('consent', saved.marketing ? 'grant' : 'revoke'); clearInterval(t); }
      if (++tries > 40) clearInterval(t);
    }, 250);
  }

  // 2) Banner
  var css = '\
#bc-root{position:fixed;z-index:2147483000;left:24px;bottom:24px;max-width:400px;font-family:inherit;color:#F4EFE6}\
#bc-root *{box-sizing:border-box}\
.bc-card{background:rgba(18,25,44,.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(217,178,95,.28);border-radius:20px;padding:20px 20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.45);animation:bc-in .35s ease both}\
@keyframes bc-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}\
.bc-eyebrow{font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase;color:#D9B25F;margin:0 0 10px}\
.bc-text{font-size:14.5px;line-height:1.5;margin:0 0 16px;color:#E6E0D4}\
.bc-text a{color:#D9B25F;text-decoration:underline;text-underline-offset:3px}\
.bc-row{display:flex;gap:10px}\
.bc-btn{flex:1;min-height:44px;border-radius:999px;font:600 14px/1 inherit;font-family:inherit;cursor:pointer;padding:0 16px;transition:transform .15s,background .15s}\
.bc-btn:active{transform:scale(.97)}\
.bc-yes{background:#D9B25F;color:#0B1020;border:1px solid #D9B25F}\
.bc-yes:hover{background:#E4C171}\
.bc-no{background:transparent;color:#F4EFE6;border:1px solid rgba(244,239,230,.35)}\
.bc-no:hover{border-color:#F4EFE6}\
.bc-link{display:block;margin:12px auto 0;background:none;border:0;color:rgba(244,239,230,.65);font:500 12.5px/1.2 inherit;font-family:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px}\
.bc-prefs{display:none;margin:0 0 14px;border-top:1px solid rgba(244,239,230,.12)}\
.bc-open .bc-prefs{display:block}\
.bc-item{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid rgba(244,239,230,.08)}\
.bc-item b{display:block;font-size:14px;margin-bottom:2px}\
.bc-item small{display:block;font-size:12.5px;line-height:1.4;color:rgba(230,224,212,.7)}\
.bc-sw{position:relative;flex:none;width:44px;height:26px}\
.bc-sw input{position:absolute;opacity:0;width:100%;height:100%;margin:0;cursor:pointer}\
.bc-sw span{position:absolute;inset:0;border-radius:99px;background:rgba(244,239,230,.2);transition:.2s;pointer-events:none}\
.bc-sw span:after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#F4EFE6;transition:.2s}\
.bc-sw input:checked+span{background:#D9B25F}\
.bc-sw input:checked+span:after{transform:translateX(18px);background:#0B1020}\
.bc-sw input:disabled+span{opacity:.55}\
.bc-sw input:focus-visible+span{outline:2px solid #D9B25F;outline-offset:2px}\
@media (max-width:560px){#bc-root{left:12px;right:12px;bottom:12px;max-width:none}.bc-card{padding:18px 16px 14px}}';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }

  function show(openPrefs) {
    if (document.getElementById('bc-root')) return;
    var cur = read() || { analytics: true, marketing: true };
    if (!document.getElementById('bc-style')) {
      var s = document.createElement('style'); s.id = 'bc-style'; s.textContent = css; document.head.appendChild(s);
    }
    var root = el(
      '<div id="bc-root" role="dialog" aria-live="polite" aria-label="Podešavanja kolačića">' +
      '<div class="bc-card' + (openPrefs ? ' bc-open' : '') + '">' +
        '<p class="bc-eyebrow">Kolačići</p>' +
        '<p class="bc-text">Koristimo kolačiće da sajt radi bolje i da vidimo šta vam je korisno. <a href="' + PRIVACY_URL + '">Saznajte više</a></p>' +
        '<div class="bc-prefs">' +
          '<div class="bc-item"><div><b>Neophodni</b><small>Potrebni da sajt radi. Uvek uključeni.</small></div><label class="bc-sw"><input type="checkbox" checked disabled><span></span></label></div>' +
          '<div class="bc-item"><div><b>Analitika</b><small>Pomažu nam da vidimo kako se sajt koristi.</small></div><label class="bc-sw"><input type="checkbox" id="bc-a"' + (cur.analytics ? ' checked' : '') + ' aria-label="Analitika"><span></span></label></div>' +
          '<div class="bc-item"><div><b>Marketing</b><small>Merenje oglasa na Instagramu i Facebooku.</small></div><label class="bc-sw"><input type="checkbox" id="bc-m"' + (cur.marketing ? ' checked' : '') + ' aria-label="Marketing"><span></span></label></div>' +
        '</div>' +
        '<div class="bc-row">' +
          '<button class="bc-btn bc-no" id="bc-no" type="button">Samo neophodni</button>' +
          '<button class="bc-btn bc-yes" id="bc-yes" type="button">Prihvatam</button>' +
        '</div>' +
        '<button class="bc-link" id="bc-pref" type="button">' + (openPrefs ? 'Sačuvaj izbor' : 'Podešavanja') + '</button>' +
      '</div></div>');
    document.body.appendChild(root);
    var card = root.firstChild;

    function done(a, m) { var c = save(a, m); apply(c, true); root.remove(); }
    root.querySelector('#bc-yes').onclick = function () { done(true, true); };
    root.querySelector('#bc-no').onclick = function () { done(false, false); };
    root.querySelector('#bc-pref').onclick = function () {
      if (!card.classList.contains('bc-open')) { card.classList.add('bc-open'); this.textContent = 'Sačuvaj izbor'; return; }
      done(root.querySelector('#bc-a').checked, root.querySelector('#bc-m').checked);
    };
  }

  // Za link u futeru: <a href="#" onclick="bulevarCookies.open();return false">Podešavanja kolačića</a>
  window.bulevarCookies = { open: function () { show(true); }, get: read };

  function init() { if (!saved) show(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
