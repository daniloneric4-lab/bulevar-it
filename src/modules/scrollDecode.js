/**
 * scrollDecode.js — Unified Scroll-Synchronized Letter Decode Engine
 *
 * Renders Bulevar.IT signature cipher/scramble text strictly synchronized with scroll progress (0..1):
 * - Deterministic glyph selection per scroll bucket => 0 idle CPU / 0 DOM writes when scroll stops
 * - Preserves layout dimensions via .rest transparent placeholder before decode completes
 * - Supports plain text, final HTML swap, and inline accent/<em> tags during decode
 * - Shared IntersectionObserver + single batched scroll pass for standalone DOM elements
 */

const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
const GL_LEN = GL.length;

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function glyphAt(charIdx, bucket) {
  const h = Math.imul(charIdx + 11, 2654435761) ^ Math.imul(bucket + 7, 2246822519);
  return GL[(h >>> 0) % GL_LEN];
}

/**
 * Renders a single element's text decoded to progress `q` (0..1) synchronized with scroll.
 * Zero DOM writes when `q` bucket hasn't changed.
 */
export function renderScrollDecode(el, text, q, finalHtml = null, noiseCount = 4) {
  if (!el) return;
  const str = String(text || '');
  if (!str) {
    if (el._sdKey !== 'empty') {
      el.innerHTML = '';
      el._sdKey = 'empty';
    }
    return;
  }

  if (reduceMotion() || q >= 1) {
    const doneKey = '1:' + (finalHtml || str);
    if (el._sdKey !== doneKey) {
      el.innerHTML = finalHtml !== null && finalHtml !== undefined ? finalHtml : escHtml(str);
      el._sdKey = doneKey;
    }
    return;
  }

  if (q <= 0) {
    const zeroKey = '0:' + str;
    if (el._sdKey !== zeroKey) {
      el.innerHTML = '<span class="rest">' + escHtml(str) + '</span>';
      el._sdKey = zeroKey;
    }
    return;
  }

  const n = str.length;
  const d = Math.floor(q * n);
  const bucket = Math.floor(q * (n * 3 + 8));
  const stateKey = d + ':' + bucket + ':' + str;
  if (el._sdKey === stateKey) return;
  el._sdKey = stateKey;

  const nz = Math.min(noiseCount, n - d);
  let noise = '';
  for (let j = 0; j < nz; j++) {
    const ch = str[d + j];
    noise += ch === ' ' || ch === '\n' || ch === '\u00A0' ? ch : glyphAt(d + j, bucket);
  }

  el.innerHTML =
    escHtml(str.slice(0, d)) +
    (nz > 0 ? '<span class="noise">' + escHtml(noise) + '</span>' : '') +
    (d + nz < n ? '<span class="rest">' + escHtml(str.slice(d + nz)) + '</span>' : '');
}

/**
 * Scroll-synchronized scramble-out (reverse vanish at end of a pinned stage).
 */
export function renderScrollScrambleOut(el, text, q, noiseCount = 4) {
  if (!el) return;
  const str = String(text || '');
  if (!str || reduceMotion() || q >= 1) {
    if (el._sdKey !== 'out:1') {
      el.innerHTML = '';
      el._sdKey = 'out:1';
    }
    return;
  }
  if (q <= 0) {
    const k0 = 'out:0:' + str;
    if (el._sdKey !== k0) {
      el.innerHTML = escHtml(str);
      el._sdKey = k0;
    }
    return;
  }

  const n = str.length;
  const d = Math.floor(q * n);
  const keep = Math.max(0, n - d);
  const bucket = Math.floor(q * (n * 3 + 8));
  const stateKey = 'out:' + keep + ':' + bucket + ':' + str;
  if (el._sdKey === stateKey) return;
  el._sdKey = stateKey;

  const nz = Math.min(noiseCount, keep);
  let noise = '';
  for (let j = 0; j < nz; j++) {
    const ch = str[keep - nz + j];
    noise += ch === ' ' ? ' ' : glyphAt(keep - nz + j, bucket);
  }
  el.innerHTML =
    escHtml(str.slice(0, keep - nz)) +
    (nz > 0 ? '<span class="noise">' + escHtml(noise) + '</span>' : '');
}

/**
 * Scroll-synchronized morph from `oldStr` to `newStr` across `q` (0..1).
 */
export function renderScrollMorph(el, oldStr, newStr, q, noiseCount = 3) {
  if (!el) return;
  const a = String(oldStr || '');
  const b = String(newStr || '');
  if (reduceMotion() || q >= 1) {
    const k1 = 'm1:' + b;
    if (el._sdKey !== k1) {
      el.innerHTML = escHtml(b);
      el._sdKey = k1;
    }
    return;
  }
  if (q <= 0) {
    const k0 = 'm0:' + a;
    if (el._sdKey !== k0) {
      el.innerHTML = escHtml(a);
      el._sdKey = k0;
    }
    return;
  }

  const maxLen = Math.max(a.length, b.length);
  const cursor = Math.floor(q * maxLen);
  const bucket = Math.floor(q * (maxLen * 3 + 8));
  const stateKey = 'm:' + cursor + ':' + bucket + ':' + a + '->' + b;
  if (el._sdKey === stateKey) return;
  el._sdKey = stateKey;

  let out = '';
  for (let i = 0; i < maxLen; i++) {
    if (i < cursor) {
      if (i < b.length) out += escHtml(b[i]);
    } else if (i < cursor + noiseCount) {
      const targetCh = i < b.length ? b[i] : (i < a.length ? a[i] : 'X');
      if (targetCh === ' ') {
        out += ' ';
      } else {
        out += '<span class="noise">' + escHtml(glyphAt(i + cursor * 7, bucket)) + '</span>';
      }
    } else if (i < a.length) {
      out += escHtml(a[i]);
    }
  }
  el.innerHTML = out;
}

/**
 * Prepares an element that may contain nested inline tags (like <em> or <span class="accent">)
 * so each text segment decodes sequentially while preserving inline HTML styling throughout!
 */
function prepareRichSegments(el, forceReset = false) {
  if (!el) return null;
  if (el._sdRich && !forceReset) return el._sdRich;

  if (forceReset && el._sdOrigHtml !== undefined) {
    el.innerHTML = el._sdOrigHtml;
  } else if (el._sdOrigHtml === undefined) {
    el._sdOrigHtml = el.innerHTML;
  }

  const segments = [];
  let totalChars = 0;

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent || '';
      if (!txt.trim() && !txt.includes(' ')) return;
      const wrapper = document.createElement('span');
      wrapper.className = 'sd-seg';
      node.parentNode.replaceChild(wrapper, node);
      segments.push({
        el: wrapper,
        text: txt,
        start: totalChars,
        len: txt.length
      });
      totalChars += txt.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') return;
      Array.from(node.childNodes).forEach(walk);
    }
  }

  walk(el);
  el._sdRich = { segments, totalChars: Math.max(1, totalChars), lastKey: '' };
  return el._sdRich;
}

export function renderRichScrollDecode(el, q) {
  if (!el) return;
  const info = prepareRichSegments(el, false);
  if (!info || !info.segments.length) return;

  const { segments, totalChars } = info;
  if (reduceMotion() || q >= 1) {
    if (info.lastKey !== 'done') {
      segments.forEach((seg) => {
        seg.el.textContent = seg.text;
      });
      info.lastKey = 'done';
    }
    return;
  }

  if (q <= 0) {
    if (info.lastKey !== 'zero') {
      segments.forEach((seg) => {
        seg.el.innerHTML = '<span class="rest">' + escHtml(seg.text) + '</span>';
      });
      info.lastKey = 'zero';
    }
    return;
  }

  const globalPos = q * totalChars;
  const dGlobal = Math.floor(globalPos);
  const bucket = Math.floor(q * (totalChars * 3 + 8));
  const key = dGlobal + ':' + bucket;
  if (info.lastKey === key) return;
  info.lastKey = key;

  const nzTotal = 4;
  segments.forEach((seg) => {
    const segEnd = seg.start + seg.len;
    if (dGlobal >= segEnd) {
      seg.el.textContent = seg.text;
    } else if (dGlobal + nzTotal <= seg.start) {
      seg.el.innerHTML = '<span class="rest">' + escHtml(seg.text) + '</span>';
    } else {
      const localDone = Math.max(0, Math.min(seg.len, dGlobal - seg.start));
      const noiseStart = Math.max(0, dGlobal - seg.start);
      const noiseEnd = Math.min(seg.len, dGlobal + nzTotal - seg.start);
      let noise = '';
      for (let i = noiseStart; i < noiseEnd; i++) {
        const ch = seg.text[i];
        noise += ch === ' ' || ch === '\n' ? ch : glyphAt(seg.start + i, bucket);
      }
      seg.el.innerHTML =
        escHtml(seg.text.slice(0, localDone)) +
        (noise ? '<span class="noise">' + escHtml(noise) + '</span>' : '') +
        (noiseEnd < seg.len ? '<span class="rest">' + escHtml(seg.text.slice(noiseEnd)) + '</span>' : '');
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Shared Viewport Scroll-Decode Registry (for non-pinned / flowing sections)
   ═══════════════════════════════════════════════════════════════════════════ */

const registry = new Map();
const visibleItems = new Set();
let io = null;
let listenersBound = false;
let rafPending = false;

function ensureObserver() {
  if (!listenersBound && typeof window !== 'undefined') {
    listenersBound = true;
    const schedule = () => {
      if (!rafPending && visibleItems.size > 0) {
        rafPending = true;
        requestAnimationFrame(flushScrollDecodes);
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('bulevar:langchange', () => {
      // Refresh source text from DOM / data-i18n / data-dec / data-t after language switch
      registry.forEach((item) => {
        refreshItemSource(item);
      });
      requestAnimationFrame(flushScrollDecodes);
    });
  }

  if (!io && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => {
        let added = false;
        entries.forEach((entry) => {
          const item = registry.get(entry.target);
          if (!item) return;
          if (entry.isIntersecting) {
            visibleItems.add(item);
            added = true;
          } else {
            visibleItems.delete(item);
          }
        });
        if (added && !rafPending) {
          rafPending = true;
          requestAnimationFrame(flushScrollDecodes);
        }
      },
      { rootMargin: '160px 0px 160px 0px', threshold: 0 }
    );
  }
}

function refreshItemSource(item) {
  const { el, rich, getText, getHtml } = item;
  el._sdKey = '';
  if (rich) {
    delete el._sdOrigHtml;
    delete el._sdRich;
    prepareRichSegments(el, false);
  } else {
    item.text = getText ? getText(el) : (el.dataset.dec || el.dataset.t || el.textContent || '');
    item.html = getHtml ? getHtml(el) : (el.dataset.html || null);
    if (el.dataset.dec !== undefined) el.dataset.dec = item.text;
    if (el.dataset.t !== undefined) el.dataset.t = item.text;
  }
}

function flushScrollDecodes() {
  rafPending = false;
  if (!visibleItems.size) return;

  const vh = window.innerHeight || 800;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const docH = Math.max(
    document.body ? document.body.scrollHeight : 0,
    document.documentElement ? document.documentElement.scrollHeight : 0
  );
  const distFromBottom = Math.max(0, docH - vh - scrollY);
  const bottomBoost = distFromBottom < 180 ? (1 - distFromBottom / 180) * 0.45 : 0;

  // Phase 1: Batch all layout reads
  const batch = [];
  visibleItems.forEach((item) => {
    const { el, triggerEl } = item;
    const target = triggerEl || el;
    const cs = window.getComputedStyle(target);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const rect = target.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    batch.push({ item, rect });
  });

  // Phase 2: Batch all DOM writes
  for (let i = 0; i < batch.length; i++) {
    const { item, rect } = batch[i];
    const startY = vh * item.startRatio;
    const endY = vh * item.endRatio;
    const span = Math.max(40, startY - endY);
    const rawQ = (startY - rect.top) / span - item.offset;
    const q = Math.max(0, Math.min(1, rawQ + bottomBoost));

    if (item.rich) {
      renderRichScrollDecode(item.el, q);
    } else {
      renderScrollDecode(item.el, item.text, q, item.html);
    }
  }
}

/**
 * Registers a DOM element to decode letter-by-letter synchronized with viewport scroll.
 *
 * @param {HTMLElement} el
 * @param {Object} [opts]
 * @param {number} [opts.startRatio=0.92] - Viewport height ratio where decode starts (0.92 = near bottom)
 * @param {number} [opts.endRatio=0.52]   - Viewport height ratio where decode reaches 100%
 * @param {number} [opts.offset=0]        - Stagger offset in [0..0.5] for grouped items
 * @param {HTMLElement} [opts.triggerEl]  - Optional shared container whose scroll position drives a group
 * @param {boolean} [opts.rich=false]     - Preserve nested HTML tags (<em>, <strong>, <span>) during decode
 * @param {Function} [opts.getText]       - Optional dynamic text getter on language/mode change
 * @param {Function} [opts.getHtml]       - Optional dynamic final HTML getter
 */
export function registerScrollDecode(el, opts = {}) {
  if (!el) return;
  ensureObserver();

  const hasChildTags = opts.rich !== undefined ? opts.rich : (el.children && el.children.length > 0);
  const existing = registry.get(el);
  if (existing && io) {
    io.unobserve(existing.triggerEl || el);
    visibleItems.delete(existing);
  }

  const item = {
    el,
    triggerEl: opts.triggerEl || null,
    startRatio: opts.startRatio ?? 0.92,
    endRatio: opts.endRatio ?? 0.52,
    offset: opts.offset ?? 0,
    rich: !!hasChildTags,
    getText: opts.getText || null,
    getHtml: opts.getHtml || null,
    text: '',
    html: null
  };

  if (item.rich) {
    el._sdOrigHtml = opts.initialHtml !== undefined ? opts.initialHtml : el.innerHTML;
    el.innerHTML = el._sdOrigHtml;
    delete el._sdRich;
    prepareRichSegments(el, false);
  } else {
    item.text = item.getText
      ? item.getText(el)
      : (opts.text !== undefined ? opts.text : (el.dataset.dec || el.dataset.t || el.textContent || ''));
    item.html = item.getHtml
      ? item.getHtml(el)
      : (opts.html !== undefined ? opts.html : (el.dataset.html || null));
  }

  registry.set(el, item);
  if (io) {
    io.observe(item.triggerEl || el);
  } else {
    visibleItems.add(item);
  }

  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(flushScrollDecodes);
  }
}

export function refreshAllScrollDecodes(reparseSources = false) {
  if (reparseSources) {
    registry.forEach((item) => refreshItemSource(item));
  }
  visibleItems.clear();
  registry.forEach((item) => visibleItems.add(item));
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(flushScrollDecodes);
  }
}

