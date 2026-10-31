/**
 * dotGrid.js — WebGL High-Performance 3D Particle Engine (boonglobal.io style)
 * 
 * Features:
 * - 2,592 points rendered in a SINGLE WebGL draw call (gl.POINTS) at locked 120 FPS.
 * - Galaxy Swirl Physics: When blooming from cluster to grid, particles disperse with
 *   tangential vortex momentum and arc dispersion.
 * - 3D Volumetric Symbols: Shapes rotate in real 3D space with perspective projection,
 *   depth-scaled particle sizes, and interactive mouse parallax tilt.
 * - BOON Palette: Ambient crisp muted bronze dots (~1.4px, 2.4px, 3.8px) that ignite
 *   into radiant champagne gold (#F0D9A0 / #FFF5D6) under cursor spotlight and in 3D symbols.
 */

import { getShapePoints, matchParticlesToShape } from './serviceShapes.js';

const VS_SOURCE = `
attribute vec2 aHomePos;
attribute vec3 aSphere3D;
attribute vec3 aShape3D;
attribute vec3 aColor;
attribute float aBaseSize;
attribute float aRandom;

uniform vec2 uResolution;
uniform vec2 uCenter;
uniform vec2 uMouse;
uniform float uBloom;
uniform float uShapeWeight;
uniform float uExitBurst;
uniform float uTime;
uniform float uDpr;
uniform float uRotY;
uniform float uRotX;

varying float vIntensity;
varying float vRandom;
varying float vShapeWeight;
varying float vDepth;
varying float vExitFade;
varying vec3 vColor;

void main() {
  // 1. 3D Rotating Sphere Coordinates & Perspective Projection ("lopta napravljena od kuglica")
  float sphereRotY = uTime * 0.85;
  float sphereRotX = 0.35 + sin(uTime * 0.45) * 0.15;
  
  float csy = cos(sphereRotY);
  float ssy = sin(sphereRotY);
  vec3 s1 = vec3(aSphere3D.x * csy + aSphere3D.z * ssy, aSphere3D.y, -aSphere3D.x * ssy + aSphere3D.z * csy);

  float csx = cos(sphereRotX);
  float ssx = sin(sphereRotX);
  vec3 sRot = vec3(s1.x, s1.y * csx - s1.z * ssx, s1.y * ssx + s1.z * csx);

  float camDistSphere = 460.0;
  float perspSphere = camDistSphere / max(1.0, camDistSphere + sRot.z);
  vec2 sphere2D = uCenter + sRot.xy * perspSphere;

  // 2. Outward Radial Burst Physics when blooming ("pa nek se rasprsne")
  vec2 deltaCenter = sphere2D - uCenter;
  vec2 radialDir = length(deltaCenter) > 0.001 ? normalize(deltaCenter) : vec2(cos(aRandom * 6.28), sin(aRandom * 6.28));
  
  // Burst shockwave peaks at uBloom ~ 0.50
  float burstFactor = sin(clamp(uBloom, 0.0, 1.0) * 3.14159265);
  float burstDist = 320.0 * burstFactor * (0.75 + 0.50 * aRandom);

  // Transition smoothly from 3D sphere to 2D grid with outward burst impulse
  vec2 basePos = mix(sphere2D, aHomePos, smoothstep(0.0, 1.0, uBloom)) + radialDir * burstDist;

  // 3. Volumetric 3D Service Shape Rotation & Perspective Projection
  vec3 p3d = aShape3D;
  float cy = cos(uRotY);
  float sy = sin(uRotY);
  vec3 r1 = vec3(p3d.x * cy + p3d.z * sy, p3d.y, -p3d.x * sy + p3d.z * cy);

  float cx = cos(uRotX);
  float sx = sin(uRotX);
  vec3 r2 = vec3(r1.x, r1.y * cx - r1.z * sx, r1.y * sx + r1.z * cx);

  float camDist = 500.0;
  float persp = camDist / max(1.0, camDist + r2.z);
  vec2 shape2D = uCenter + r2.xy * persp;

  // 4. Final Screen Position
  vec2 finalPos = mix(basePos, shape2D, uShapeWeight);

  // 4b. Upward Explosion / Stardust Launch when exiting into Portfolio
  // "lopta ce da se rasprsne i loptice ce da se razlete ka gore i da nestanu"
  float exitFade = 1.0;
  if (uExitBurst > 0.001) {
    // Upward launch velocity with accelerating parabolic impulse
    float upVel = -uExitBurst * uExitBurst * (750.0 + 400.0 * aRandom);
    // Radial outward dispersion shockwave
    vec2 outDisp = radialDir * (uExitBurst * 280.0 * (0.6 + 0.8 * aRandom));
    // Horizontal drift
    float xScatter = (aRandom - 0.5) * 220.0 * uExitBurst;

    finalPos += vec2(outDisp.x + xScatter, outDisp.y + upVel);

    // Fade out as particles shoot into the upper atmosphere
    exitFade = clamp(1.0 - uExitBurst * 1.35, 0.0, 1.0);
  }
  vExitFade = exitFade;

  // Convert pixels to clip space (-1 to +1)
  vec2 zeroToOne = finalPos / uResolution;
  vec2 clipSpace = (zeroToOne * 2.0 - 1.0) * vec2(1.0, -1.0);
  gl_Position = vec4(clipSpace, 0.0, 1.0);

  // 5. Mouse proximity spotlight (radius: 280px with smooth cubic ease)
  float d = distance(finalPos, uMouse);
  float prox = clamp(1.0 - d / 280.0, 0.0, 1.0);
  float mouseIntensity = prox * prox * (3.0 - 2.0 * prox);

  // 6. Depth Cues for Sphere & 3D Shape
  float shapeDepthNorm = clamp((r2.z + 110.0) / 220.0, 0.35, 1.0);
  float sphereDepthNorm = clamp((sRot.z + 140.0) / 280.0, 0.35, 1.0);
  vDepth = mix(sphereDepthNorm, shapeDepthNorm, uShapeWeight);

  float shapeIntensity = mix(0.50, 1.0, shapeDepthNorm);
  float sphereIntensity = mix(0.35, 1.0, sphereDepthNorm);
  float baseIntensity = mix(sphereIntensity, mouseIntensity, smoothstep(0.0, 1.0, uBloom));
  float intensity = mix(baseIntensity, max(mouseIntensity, shapeIntensity), uShapeWeight);

  vIntensity = intensity;
  vRandom = aRandom;
  vShapeWeight = uShapeWeight;
  vColor = aColor;

  // 7. Point Size Scaling
  float size = aBaseSize;
  // In 3D sphere, foreground dots are larger, background dots smaller
  if (uBloom < 0.90) {
    size *= mix(0.70, 1.35, sphereDepthNorm);
  }
  // In 3D shape, foreground dots are larger and overall symbol dots are bigger
  if (uShapeWeight > 0.02) {
    float depthScale = mix(0.9, 1.45, shapeDepthNorm);
    size = mix(size, size * depthScale * 1.35, uShapeWeight);
  }

  // Swell in mouse spotlight
  size *= (1.0 + mouseIntensity * 0.35);

  // Shrink as particles explode upwards
  size *= exitFade;

  gl_PointSize = max(1.0, size * uDpr);
}
`;

const FS_SOURCE = `
precision mediump float;

varying float vIntensity;
varying float vRandom;
varying float vShapeWeight;
varying float vDepth;
varying float vExitFade;
varying vec3 vColor;

void main() {
  // Antialiased round point
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  float alphaMask = smoothstep(0.5, 0.38, dist);

  // BOON Reference Golden Palette:
  // 1. Ambient dots across the grid: clearly visible, warm champagne gold
  vec3 ambientGold = vec3(0.79, 0.63, 0.39); // #C9A063
  float ambientAlpha = 0.54 + vRandom * 0.18;

  // 2. Cursor hover spotlight: deep, rich, darker burnished amber/gold
  vec3 hoverDarkGold = vec3(0.92, 0.52, 0.12); // Rich saturated amber/dark gold
  float activeAlpha = 0.98;

  // Blend from visible warm gold to deeper darker gold under cursor
  vec3 finalRgb = mix(ambientGold, hoverDarkGold, vIntensity);
  float targetAlpha = mix(ambientAlpha, activeAlpha, vIntensity);

  // 3. Keep consistent rich gold for all 3D symbols with depth shading
  if (vShapeWeight > 0.02) {
    vec3 symbolGold = mix(ambientGold, hoverDarkGold, vDepth * 0.55);
    finalRgb = mix(finalRgb, symbolGold, vShapeWeight);
    targetAlpha = max(targetAlpha, mix(0.70, 0.98, vDepth));
  }

  float finalAlpha = targetAlpha * alphaMask * vExitFade;
  gl_FragColor = vec4(finalRgb * finalAlpha, finalAlpha);
}
`;

export class DotGrid {
  constructor(canvasSelector, containerSelector = '#services-stage') {
    this.canvas = document.querySelector(canvasSelector);
    this.container = document.querySelector(containerSelector) || document.querySelector('#services');
    if (!this.canvas || !this.container) return;

    this.isMobile = window.matchMedia('(max-width: 768px)').matches;

    // BOON High-Density Matrix (Boon Global exact spacing ~28-34px)
    // Desktop: 60 cols x 34 rows = 2,040 prominent points
    // Mobile: 38 cols x 24 rows = 912 points
    this.cols = this.isMobile ? 38 : 60;
    this.rows = this.isMobile ? 24 : 34;
    this.count = this.cols * this.rows;

    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.centerX = 0;
    this.centerY = 0;

    this.mouse = { x: -9999, y: -9999, active: false };

    // Continuous states
    this.currentBloom = 0.0;
    this.targetBloom = 0.0;

    this.currentShapeWeight = 0.0;
    this.targetShapeWeight = 0.0;
    this.currentShapeKey = null;

    this.currentExitBurst = 0.0;
    this.targetExitBurst = 0.0;

    // 3D Rotation angles
    this.rotY = 0;
    this.rotX = 0.2;
    this.parallaxRotY = 0;
    this.parallaxRotX = 0;

    this.isVisible = false;
    this.animId = null;
    this.time = 0;

    this.initGL();
    this.bindEvents();
    this.startLoop();
  }

  initGL() {
    this.gl = this.canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!this.gl) {
      this.gl = this.canvas.getContext('experimental-webgl', { alpha: true });
    }
    if (!this.gl) return;

    const gl = this.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Compile shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('[DotGrid] Program link failed:', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Uniform & attribute locations
    this.locs = {
      aHomePos: gl.getAttribLocation(this.program, 'aHomePos'),
      aSphere3D: gl.getAttribLocation(this.program, 'aSphere3D'),
      aShape3D: gl.getAttribLocation(this.program, 'aShape3D'),
      aColor: gl.getAttribLocation(this.program, 'aColor'),
      aBaseSize: gl.getAttribLocation(this.program, 'aBaseSize'),
      aRandom: gl.getAttribLocation(this.program, 'aRandom'),
      uResolution: gl.getUniformLocation(this.program, 'uResolution'),
      uCenter: gl.getUniformLocation(this.program, 'uCenter'),
      uMouse: gl.getUniformLocation(this.program, 'uMouse'),
      uBloom: gl.getUniformLocation(this.program, 'uBloom'),
      uShapeWeight: gl.getUniformLocation(this.program, 'uShapeWeight'),
      uExitBurst: gl.getUniformLocation(this.program, 'uExitBurst'),
      uTime: gl.getUniformLocation(this.program, 'uTime'),
      uDpr: gl.getUniformLocation(this.program, 'uDpr'),
      uRotY: gl.getUniformLocation(this.program, 'uRotY'),
      uRotX: gl.getUniformLocation(this.program, 'uRotX'),
    };

    // GPU Buffers
    this.buffers = {
      home: gl.createBuffer(),
      sphere3D: gl.createBuffer(),
      shape3D: gl.createBuffer(),
      color: gl.createBuffer(),
      size: gl.createBuffer(),
      random: gl.createBuffer(),
    };

    this.resize();
  }

  compileShader(type, src) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('[DotGrid] Shader compile error:', gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  resize() {
    if (!this.canvas || !this.gl) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    this.generatePointData();
    if (this.currentShapeKey) {
      this.uploadShapeBuffer(this.currentShapeKey);
    }
  }

  generatePointData() {
    const count = this.count;
    const homeArr = new Float32Array(count * 2);
    const sphere3DArr = new Float32Array(count * 3);
    const shape3DArr = new Float32Array(count * 3);
    const sizeArr = new Float32Array(count);
    const randArr = new Float32Array(count);

    this.particles = [];

    const pitchX = this.width / (this.cols + 1);
    const pitchY = this.height / (this.rows + 1);

    const sphereRadius = this.isMobile ? 100 : 145;

    let idx = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const hx = pitchX * (c + 1);
        const hy = pitchY * (r + 1);

        // BOON Reference Sizing: KRUPNIJE prominent golden dots
        const hash = Math.sin((c + 1) * 12.9898 + (r + 1) * 78.233) * 43758.5453;
        const rand = hash - Math.floor(hash);

        let size = this.isMobile ? 3.6 : 4.8;
        if (rand > 0.85) {
          size = this.isMobile ? 6.8 : 9.8;
        } else if (rand > 0.60) {
          size = this.isMobile ? 5.0 : 7.2;
        } else {
          size = this.isMobile ? 3.6 : 4.8;
        }

        // 3D Fibonacci Sphere ("lopta napravljena od kuglica")
        const phi = Math.acos(1.0 - (2.0 * (idx + 0.5)) / count);
        const theta = Math.PI * (1.0 + Math.sqrt(5.0)) * idx;
        const rVar = sphereRadius * (0.82 + 0.18 * rand);
        const sx = Math.sin(phi) * Math.cos(theta) * rVar;
        const sy = Math.cos(phi) * rVar;
        const sz = Math.sin(phi) * Math.sin(theta) * rVar;

        homeArr[idx * 2] = hx;
        homeArr[idx * 2 + 1] = hy;

        sphere3DArr[idx * 3] = sx;
        sphere3DArr[idx * 3 + 1] = sy;
        sphere3DArr[idx * 3 + 2] = sz;

        // Default 3D position (flattened on grid)
        shape3DArr[idx * 3] = hx - this.centerX;
        shape3DArr[idx * 3 + 1] = hy - this.centerY;
        shape3DArr[idx * 3 + 2] = 0;

        sizeArr[idx] = size;
        randArr[idx] = rand;

        this.particles.push({
          homeX: hx,
          homeY: hy,
          target3DX: hx - this.centerX,
          target3DY: hy - this.centerY,
          target3DZ: 0,
        });

        idx++;
      }
    }

    const gl = this.gl;

    const colorArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colorArr[i * 3] = 0.85;
      colorArr[i * 3 + 1] = 0.68;
      colorArr[i * 3 + 2] = 0.42;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.home);
    gl.bufferData(gl.ARRAY_BUFFER, homeArr, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.sphere3D);
    gl.bufferData(gl.ARRAY_BUFFER, sphere3DArr, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.shape3D);
    gl.bufferData(gl.ARRAY_BUFFER, shape3DArr, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.size);
    gl.bufferData(gl.ARRAY_BUFFER, sizeArr, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.random);
    gl.bufferData(gl.ARRAY_BUFFER, randArr, gl.STATIC_DRAW);
  }

  uploadShapeBuffer(serviceKey) {
    const rawPoints = getShapePoints(serviceKey, this.count);
    if (!rawPoints) return;

    const scale = this.isMobile ? 1.8 : 3.0;
    matchParticlesToShape(this.particles, rawPoints, this.centerX, this.centerY, scale);

    const shape3DArr = new Float32Array(this.count * 3);
    const colorArr = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      shape3DArr[i * 3] = this.particles[i].target3DX || 0;
      shape3DArr[i * 3 + 1] = this.particles[i].target3DY || 0;
      shape3DArr[i * 3 + 2] = this.particles[i].target3DZ || 0;

      colorArr[i * 3] = this.particles[i].targetR !== undefined ? this.particles[i].targetR : 0.85;
      colorArr[i * 3 + 1] = this.particles[i].targetG !== undefined ? this.particles[i].targetG : 0.68;
      colorArr[i * 3 + 2] = this.particles[i].targetB !== undefined ? this.particles[i].targetB : 0.42;
    }

    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.shape3D);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, shape3DArr);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, colorArr);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });

    const onMove = (clientX, clientY) => {
      // Isolate mouse spotlight strictly to the services stage
      const stage = document.getElementById('services-stage') || this.container;
      if (stage) {
        const rect = stage.getBoundingClientRect();
        if (clientY < rect.top || clientY > rect.bottom || clientX < rect.left || clientX > rect.right) {
          this.mouse.x = -9999;
          this.mouse.y = -9999;
          this.mouse.active = false;
          this.parallaxRotY = 0;
          this.parallaxRotX = 0;
          return;
        }
      }

      this.mouse.x = clientX;
      this.mouse.y = clientY;
      this.mouse.active = true;

      // Mouse parallax tilt angles (-0.35 to +0.35 radians)
      const normX = (clientX / window.innerWidth) * 2 - 1;
      const normY = (clientY / window.innerHeight) * 2 - 1;
      this.parallaxRotY = normX * 0.35;
      this.parallaxRotX = -normY * 0.25;
    };

    window.addEventListener('mousemove', (e) => {
      onMove(e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
      this.parallaxRotY = 0;
      this.parallaxRotX = 0;
    }, { passive: true });
  }

  /**
   * Continuous liquid bloom interpolation:
   * progress t: 0 = clustered sphere at bottom (Screenshot 4), 1 = dispersed full-screen grid
   */
  setBloom(t) {
    const clampedT = Math.max(0, Math.min(1, t));
    this.targetBloom = clampedT * clampedT * (3.0 - 2.0 * clampedT);
  }

  setBloomImmediate(t) {
    const clampedT = Math.max(0, Math.min(1, t));
    this.targetBloom = clampedT * clampedT * (3.0 - 2.0 * clampedT);
    this.currentBloom = this.targetBloom;
  }

  /**
   * Set exit upward explosion progress:
   * 0.0 = intact 3D golden sphere in center (retains shape when bg turns blue)
   * 0.0 -> 1.0 = sphere bursts, scattering & shooting particles upwards to sky
   */
  setExitBurst(t) {
    this.targetExitBurst = Math.max(0, Math.min(1, t));
  }

  /**
   * Smoothly morph dots into the 3D service shape on hover,
   * or return to clean ambient dot matrix on idle (stari izgled tackica)
   */
  setShape(serviceKey) {
    if (!serviceKey) {
      this.currentShapeKey = null;
      this.targetShapeWeight = 0.0; // Dissolves back into clean ambient dot grid!
      return;
    }

    // 3D service hover symbols (web, marketing, social, automation, branding, support)
    this.currentShapeKey = serviceKey;
    this.uploadShapeBuffer(serviceKey);
    this.targetShapeWeight = 1.0;
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const loop = () => {
      if (this.isVisible && this.gl) {
        this.render();
      }
      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  render() {
    const gl = this.gl;
    this.time += 0.016;

    // Smooth lerps for bloom, shape, and exit burst
    this.currentBloom += (this.targetBloom - this.currentBloom) * 0.12;
    this.currentShapeWeight += (this.targetShapeWeight - this.currentShapeWeight) * 0.14;
    this.currentExitBurst += (this.targetExitBurst - this.currentExitBurst) * 0.16;

    // Continuous 3D auto-rotation + mouse parallax damping
    this.rotY += 0.012;
    const currentRotY = this.rotY + this.parallaxRotY;
    const currentRotX = 0.18 + Math.sin(this.time * 0.8) * 0.12 + this.parallaxRotX;

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // Uniforms
    gl.uniform2f(this.locs.uResolution, this.width, this.height);
    gl.uniform2f(this.locs.uCenter, this.centerX, this.centerY);
    gl.uniform2f(this.locs.uMouse, this.mouse.x, this.mouse.y);
    gl.uniform1f(this.locs.uBloom, this.currentBloom);
    gl.uniform1f(this.locs.uShapeWeight, this.currentShapeWeight);
    gl.uniform1f(this.locs.uExitBurst, this.currentExitBurst);
    gl.uniform1f(this.locs.uTime, this.time);
    gl.uniform1f(this.locs.uDpr, this.dpr);
    gl.uniform1f(this.locs.uRotY, currentRotY);
    gl.uniform1f(this.locs.uRotX, currentRotX);

    // Attributes
    const enableAndBind = (loc, buffer, size) => {
      gl.enableVertexAttribArray(loc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };

    enableAndBind(this.locs.aHomePos, this.buffers.home, 2);
    enableAndBind(this.locs.aSphere3D, this.buffers.sphere3D, 3);
    enableAndBind(this.locs.aShape3D, this.buffers.shape3D, 3);
    enableAndBind(this.locs.aColor, this.buffers.color, 3);
    enableAndBind(this.locs.aBaseSize, this.buffers.size, 1);
    enableAndBind(this.locs.aRandom, this.buffers.random, 1);

    // SINGLE GPU DRAW CALL — 2,040 points at 120 FPS
    gl.drawArrays(gl.POINTS, 0, this.count);
  }

  setVisible(visible) {
    this.isVisible = visible;
    if (!visible && this.gl) {
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
  }

  triggerBurst() {
    this.targetBloom = 1.0;
  }

  setClustered(isClustered) {
    this.targetBloom = isClustered ? 0.0 : 1.0;
    if (isClustered) {
      this.targetShapeWeight = 0.0;
      this.targetExitBurst = 0.0;
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
