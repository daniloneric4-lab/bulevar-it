/**
 * ScrollVideo — Frame-sequence scrubbing via Canvas 2D API
 * 
 * Maps scroll progress (0–1) within a GSAP ScrollTrigger range to a
 * corresponding frame from a pre-loaded image sequence and draws it
 * on a <canvas> element.
 *
 * Optimised for smooth scroll scrubbing:
 * - Batch loading (configurable concurrency) to avoid memory spikes
 * - Pre-decodes images into ImageBitmaps (GPU-ready, zero per-draw decode cost)
 * - Opaque canvas with desynchronized hint (lower latency compositing)
 * - Cached cover-fit geometry (recalculated only on resize)
 * - No clearRect needed (full-canvas drawImage overwrites everything)
 * - DPR 1:1 (source frames match display; no upscaling waste)
 * - Direct draw from GSAP onUpdate (already inside RAF, no extra scheduling)
 */
export class ScrollVideo {
  /**
   * @param {string}  canvasSelector  — CSS selector for the <canvas> element
   * @param {string}  folderPath      — Path to frames folder (e.g. '/frames/hero-opt/')
   * @param {number}  frameCount      — Total number of frames (1-indexed)
   * @param {string}  [prefix='frame_'] — File name prefix
   * @param {string}  [ext='.webp']    — File extension
   */
  constructor(canvasSelector, folderPath, frameCount, prefix = 'frame_', ext = '.webp') {
    this.canvas = document.querySelector(canvasSelector);
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });

    this.folderPath = folderPath;
    this.frameCount = frameCount;
    this.prefix = prefix;
    this.ext = ext;

    /** @type {(ImageBitmap|HTMLImageElement|null)[]} */
    this.frames = new Array(frameCount).fill(null);
    this.currentFrame = -1;
    this.loaded = false;
    this.loadedCount = 0;

    // Cached cover-fit draw params
    this._drawParams = null;
    this._imgW = 0;
    this._imgH = 0;

    this._resizeRaf = 0;
    this._resizeHandler = this._onResize.bind(this);

    this._resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  /**
   * Preload frame images in controlled batches to avoid memory spikes.
   * @param {boolean} [skipAlternate=false] — If true, only load every 2nd frame (mobile)
   * @param {number}  [batchSize=15]       — How many frames to fetch concurrently per batch
   * @param {function} [onProgress]         — Optional callback(loaded, total)
   * @returns {Promise<void>}
   */
  async preload(skipAlternate = false, batchSize = 15, onProgress = null) {
    const canBitmap = typeof createImageBitmap === 'function';

    // Build list of { index, src } tasks
    const tasks = [];
    for (let i = 1; i <= this.frameCount; i++) {
      if (skipAlternate && i % 2 === 0) continue;
      const idx = String(i).padStart(3, '0');
      const src = `${this.folderPath}${this.prefix}${idx}${this.ext}`;
      tasks.push({ frameIndex: i - 1, src });
    }

    const total = tasks.length;

    // Load a single frame
    const loadOne = async ({ frameIndex, src }) => {
      try {
        if (canBitmap) {
          const r = await fetch(src);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const blob = await r.blob();
          const bmp = await createImageBitmap(blob);
          this.frames[frameIndex] = bmp;
        } else {
          const img = await new Promise((resolve, reject) => {
            const el = new Image();
            el.decoding = 'async';
            el.onload = () => resolve(el);
            el.onerror = reject;
            el.src = src;
          });
          this.frames[frameIndex] = img;
        }
      } catch {
        console.warn(`[ScrollVideo] Failed: frame ${frameIndex + 1}`);
        this.frames[frameIndex] = null;
      }

      this.loadedCount++;
      if (onProgress) onProgress(this.loadedCount, total);
    };

    // Process in batches
    for (let start = 0; start < tasks.length; start += batchSize) {
      const batch = tasks.slice(start, start + batchSize);
      await Promise.all(batch.map(loadOne));
    }

    // Cache source dimensions from first loaded frame
    const first = this.frames.find(f => f !== null);
    if (first) {
      this._imgW = first.width || first.naturalWidth;
      this._imgH = first.height || first.naturalHeight;
      this._updateDrawParams();
    }

    // Fill null gaps (for skipped frames — duplicate nearest)
    if (skipAlternate) {
      for (let i = 0; i < this.frames.length; i++) {
        if (!this.frames[i]) {
          this.frames[i] = this.frames[i - 1] || this.frames[i + 1] || null;
        }
      }
    }

    this.loaded = true;
    this._drawFrame(0);
  }

  /**
   * Draw frame by index. Called directly from GSAP onUpdate (already in RAF).
   * @param {number} index — 0-based frame index
   */
  _drawFrame(index) {
    if (!this._drawParams) return;

    const idx = Math.max(0, Math.min(index, this.frames.length - 1));
    if (idx === this.currentFrame) return;

    // Find nearest loaded frame if this one isn't ready yet
    let frame = this.frames[idx];
    if (!frame) {
      // Search nearby frames
      for (let offset = 1; offset < 5; offset++) {
        frame = this.frames[idx - offset] || this.frames[idx + offset];
        if (frame) break;
      }
      if (!frame) return;
    }

    this.currentFrame = idx;
    const p = this._drawParams;
    this.ctx.drawImage(frame, p.sx, p.sy, p.sw, p.sh, 0, 0, p.dw, p.dh);
  }

  /**
   * Map scroll progress (0–1) to frame index and draw.
   * @param {number} progress
   */
  update(progress) {
    this._drawFrame(Math.round(progress * (this.frames.length - 1)));
  }

  /** Recalculate cover-fit geometry */
  _updateDrawParams() {
    if (!this._imgW) return;
    const dw = this.canvas.width, dh = this.canvas.height;
    const cR = dw / dh, iR = this._imgW / this._imgH;
    let sx = 0, sy = 0, sw = this._imgW, sh = this._imgH;
    if (iR > cR) { sw = this._imgH * cR; sx = (this._imgW - sw) / 2; }
    else         { sh = this._imgW / cR;  sy = (this._imgH - sh) / 2; }
    this._drawParams = { sx, sy, sw, sh, dw, dh };
  }

  /** Debounced resize */
  _onResize() {
    if (this._resizeRaf) return;
    this._resizeRaf = requestAnimationFrame(() => {
      this._resizeRaf = 0;
      this._resize();
    });
  }

  /** Resize canvas 1:1 with CSS pixels */
  _resize() {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (this.canvas.width === w && this.canvas.height === h) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this._updateDrawParams();
    if (this.loaded) { this.currentFrame = -1; this._drawFrame(0); }
  }

  /** Cleanup */
  destroy() {
    window.removeEventListener('resize', this._resizeHandler);
    if (this._resizeRaf) cancelAnimationFrame(this._resizeRaf);
    this.frames.forEach(f => { if (f?.close) f.close(); });
    this.frames = [];
    this.loaded = false;
  }
}
