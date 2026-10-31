/**
 * serviceShapes.js — High-Density 3D Volumetric Geometric Sculptures (boonglobal.io inspired)
 * 
 * Generates true volumetric 3D coordinates (x, y, z) and optional RGB color tinting for the 6 services:
 * - web: 3D Volumetric `< / >` Code Brackets, Terminal Header & Orbital Data Rings
 * - marketing: 3D Aerodynamic Flocking Wings & Ascending Double-Helix Vortex (Boon Frame 4)
 * - social: 3D Holographic Network Sphere & Concentric Harmonic Wave Belts (Boon Frame 5)
 * - automation: 3D Quantum Tri-Axis Gyroscope Gimbal & Rotating Tesseract Engine
 * - branding: 3D Volumetric Interlocking RGB Color Rings (Additive Venn Diagram Model)
 * - support: 3D Microsoft Defender Fortress Shield with 4 Distinct Quadrants & Cross Divide
 */

/**
 * Distribute N points along a 3D line segment with optional volumetric beam jitter and color
 */
function sample3DLine(p1, p2, count, jitter = 0, color = null) {
  const pts = [];
  if (count <= 0) return pts;
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    let x = p1.x + (p2.x - p1.x) * t;
    let y = p1.y + (p2.y - p1.y) * t;
    let z = p1.z + (p2.z - p1.z) * t;

    if (jitter > 0) {
      const jx = (Math.random() - 0.5) * jitter;
      const jy = (Math.random() - 0.5) * jitter;
      const jz = (Math.random() - 0.5) * jitter;
      x += jx;
      y += jy;
      z += jz;
    }

    pts.push({
      x,
      y,
      z,
      intensity: p1.intensity !== undefined ? p1.intensity : 0.95,
      color: color || p1.color || null,
    });
  }
  return pts;
}

/**
 * Distribute N points along a 3D circle/ring in an arbitrary plane with optional thickness and color
 */
function sample3DCircle(cx, cy, cz, radius, count, rotX = 0, rotY = 0, rotZ = 0, thickness = 0, color = null) {
  const pts = [];
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    const rad = thickness > 0 ? radius + (Math.random() - 0.5) * thickness : radius;

    let x = Math.cos(theta) * rad;
    let y = Math.sin(theta) * rad;
    let z = thickness > 0 ? (Math.random() - 0.5) * (thickness * 0.7) : 0;

    // Euler rotations
    let x1 = x * cosZ - y * sinZ;
    let y1 = x * sinZ + y * cosZ;
    let z1 = z;

    let x2 = x1 * cosY + z1 * sinY;
    let y2 = y1;
    let z2 = -x1 * sinY + z1 * cosY;

    let x3 = x2;
    let y3 = y2 * cosX - z2 * sinX;
    let z3 = y2 * sinX + z2 * cosX;

    pts.push({
      x: cx + x3,
      y: cy + y3,
      z: cz + z3,
      intensity: 0.96,
      color,
    });
  }
  return pts;
}

/**
 * Distribute N points inside a volumetric 3D Torus with optional color
 */
function sample3DTorus(cx, cy, cz, R, rTube, count, rotX = 0, rotY = 0, rotZ = 0, color = null) {
  const pts = [];
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2; // Major angle
    const v = (i * 7.618) % (Math.PI * 2); // Minor angle
    const rVar = rTube * (0.3 + 0.7 * Math.sqrt(Math.random()));

    let x = (R + rVar * Math.cos(v)) * Math.cos(u);
    let y = (R + rVar * Math.cos(v)) * Math.sin(u);
    let z = rVar * Math.sin(v);

    let x1 = x * cosZ - y * sinZ;
    let y1 = x * sinZ + y * cosZ;
    let z1 = z;

    let x2 = x1 * cosY + z1 * sinY;
    let y2 = y1;
    let z2 = -x1 * sinY + z1 * cosY;

    let x3 = x2;
    let y3 = y2 * cosX - z2 * sinX;
    let z3 = y2 * sinX + z2 * cosX;

    pts.push({
      x: cx + x3,
      y: cy + y3,
      z: cz + z3,
      intensity: 0.95,
      color,
    });
  }
  return pts;
}

// ─── 1. WEB: 3D Volumetric `< / >` Code Brackets & Floating Terminal Data ───
function generateWebShape(count) {
  const pts = [];
  const codeCount = Math.floor(count * 0.65);
  const ringCount = count - codeCount;

  // Left Angle Bracket `<`
  const leftApex = { x: -92, y: 0, z: 0 };
  const leftTop = { x: -34, y: -88, z: -12 };
  const leftBot = { x: -34, y: 88, z: -12 };

  // Center Slash `/`
  const slashBot = { x: -22, y: 104, z: -18 };
  const slashTop = { x: 22, y: -104, z: 18 };

  // Right Angle Bracket `>`
  const rightApex = { x: 92, y: 0, z: 0 };
  const rightTop = { x: 34, y: -88, z: -12 };
  const rightBot = { x: 34, y: 88, z: -12 };

  // Sample the 5 main code beams with volumetric particle width
  const ptsPerArm = Math.floor(codeCount * 0.72 / 5);
  pts.push(...sample3DLine(leftTop, leftApex, ptsPerArm, 4.0));
  pts.push(...sample3DLine(leftApex, leftBot, ptsPerArm, 4.0));
  pts.push(...sample3DLine(slashBot, slashTop, ptsPerArm, 4.2));
  pts.push(...sample3DLine(rightTop, rightApex, ptsPerArm, 4.0));
  pts.push(...sample3DLine(rightApex, rightBot, ptsPerArm, 4.0));

  // Top Terminal Header Bar & 3 Window Control Dots
  const barPts = Math.floor(codeCount * 0.16);
  const barLeft = { x: -115, y: -126, z: 0 };
  const barRight = { x: 115, y: -126, z: 0 };
  pts.push(...sample3DLine(barLeft, barRight, barPts, 2.0));

  // 3 Window Control Dots (-90, -70, -50)
  const dotPts = Math.floor((codeCount - pts.length) / 3);
  for (let dX of [-92, -72, -52]) {
    for (let i = 0; i < dotPts; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 5.5;
      pts.push({
        x: dX + Math.cos(a) * r,
        y: -126 + Math.sin(a) * r,
        z: (Math.random() - 0.5) * 3,
        intensity: 0.98,
      });
    }
  }

  // Dual Tilted Orbital Data Halo Rings around `< / >`
  const ring1Count = Math.floor(ringCount * 0.52);
  const ring2Count = ringCount - ring1Count;
  pts.push(...sample3DTorus(0, 0, 0, 134, 9.0, ring1Count, 0.45, 0.22, 0));
  pts.push(...sample3DTorus(0, 0, 0, 148, 10.0, ring2Count, -0.58, 0.35, 0));

  return pts;
}

// ─── 2. MARKETING: 3D Aerodynamic Flocking Wings & Ascending Helix (Boon Frame 4) ───
function generateMarketingShape(count) {
  const pts = [];
  const wingsCount = Math.floor(count * 0.68);
  const helixCount = count - wingsCount;

  // 1. Aerodynamic Sweeping V-Wings (Boon Global frame 4 soaring chevron)
  const halfWings = Math.floor(wingsCount / 2);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < halfWings; i++) {
      const t = i / (halfWings - 1);
      const span = 18 + Math.pow(t, 0.85) * 118;
      const chordY = 70 - Math.pow(t, 0.95) * 180;
      const depthZ = (1.0 - t) * 20 - Math.pow(t, 1.4) * 45;

      const featherR = (1.0 - t * 0.5) * 16.0;
      const fAngle = i * 2.399;
      const ox = Math.cos(fAngle) * (featherR * Math.random());
      const oy = Math.sin(fAngle) * (featherR * 0.65 * Math.random());
      const oz = (Math.random() - 0.5) * 14;

      pts.push({
        x: side * span + ox,
        y: chordY + oy,
        z: depthZ + oz,
        intensity: 0.96,
      });
    }
  }

  // 2. Central Ascending Double-Helix Growth Vortex & Apex Beacon
  const helixStrand = Math.floor(helixCount * 0.42);
  const totalH = 210;
  for (let s = 0; s < 2; s++) {
    const sOffset = s * Math.PI;
    for (let i = 0; i < helixStrand; i++) {
      const t = i / (helixStrand - 1);
      const theta = sOffset + t * Math.PI * 2 * 2.8;
      const r = 16 + Math.pow(t, 1.35) * 55;
      const y = totalH / 2 - t * totalH;
      pts.push({
        x: Math.cos(theta) * r,
        y: y,
        z: Math.sin(theta) * r,
        intensity: 0.98,
      });
    }
  }

  // Apex Chevron Beacon
  const beaconCount = helixCount - helixStrand * 2;
  const tip = { x: 0, y: -totalH / 2 - 25, z: 0 };
  const b1 = { x: -35, y: -totalH / 2 + 10, z: 0 };
  const b2 = { x: 35, y: -totalH / 2 + 10, z: 0 };
  const b3 = { x: 0, y: -totalH / 2 + 10, z: 30 };
  const b4 = { x: 0, y: -totalH / 2 + 10, z: -30 };
  const perB = Math.floor(beaconCount / 4);
  pts.push(...sample3DLine(tip, b1, perB, 2.0));
  pts.push(...sample3DLine(tip, b2, perB, 2.0));
  pts.push(...sample3DLine(tip, b3, perB, 2.0));
  pts.push(...sample3DLine(tip, b4, beaconCount - perB * 3, 2.0));

  return pts;
}

// ─── 3. SOCIAL: 3D Holographic Network Sphere & Harmonic Wave Belts (Boon Frame 5) ───
function generateSocialShape(count) {
  const pts = [];
  const coreCount = Math.floor(count * 0.32);
  const beltsCount = Math.floor(count * 0.52);
  const bridgesCount = count - coreCount - beltsCount;

  // 1. Dense Holographic Fibonacci Network Core (R = 48)
  const coreR = 48;
  for (let i = 0; i < coreCount; i++) {
    const phi = Math.acos(1.0 - (2.0 * (i + 0.5)) / coreCount);
    const theta = Math.PI * (1.0 + Math.sqrt(5.0)) * i;
    const layer = 0.5 + 0.5 * Math.cbrt(Math.random());
    const rVar = coreR * layer * (0.92 + 0.08 * Math.sin(i * 8.3));
    pts.push({
      x: Math.sin(phi) * Math.cos(theta) * rVar,
      y: Math.cos(phi) * rVar,
      z: Math.sin(phi) * Math.sin(theta) * rVar,
      intensity: 0.98,
    });
  }

  // 2. Three Undulating 3D Harmonic Wave Belts (R = 85, 115, 142)
  const beltRadii = [85, 115, 142];
  const ptsPerBelt = Math.floor(beltsCount / beltRadii.length);
  for (let bIdx = 0; bIdx < beltRadii.length; bIdx++) {
    const rad = beltRadii[bIdx];
    const nPts = bIdx === beltRadii.length - 1 ? (beltsCount - ptsPerBelt * (beltRadii.length - 1)) : ptsPerBelt;
    const tilt = 0.32 * Math.sin(bIdx * 1.6);
    const waveAmp = 9 + bIdx * 4.5;

    for (let i = 0; i < nPts; i++) {
      const theta = (i / nPts) * Math.PI * 2;
      const wave = Math.sin(theta * 6 + bIdx * 2.1) * waveAmp;
      const ribbonWidth = (Math.random() - 0.5) * 12;
      const x = Math.cos(theta) * (rad + ribbonWidth);
      const z = Math.sin(theta) * (rad + ribbonWidth);
      const y = wave + z * Math.sin(tilt);

      pts.push({
        x: x,
        y: y,
        z: z * Math.cos(tilt),
        intensity: 0.94,
      });
    }
  }

  // 3. Longitudinal Network Arc Filaments
  const numArcs = 6;
  const perArc = Math.floor(bridgesCount / numArcs);
  for (let a = 0; a < numArcs; a++) {
    const arcAngle = (a / numArcs) * Math.PI * 2;
    const n = a === numArcs - 1 ? (count - pts.length) : perArc;
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * Math.PI;
      const rArc = 112 + Math.sin(t) * 28;
      const y = -Math.cos(t) * 120;
      const radAtY = Math.sin(t) * rArc;
      pts.push({
        x: Math.cos(arcAngle) * radAtY,
        y: y,
        z: Math.sin(arcAngle) * radAtY,
        intensity: 0.90,
      });
    }
  }

  return pts;
}

// ─── 4. AUTOMATION: 3D Quantum Tri-Axis Gyroscope & Rotating Tesseract Engine ───
function generateAutomationShape(count) {
  const pts = [];
  const gimbalsCount = Math.floor(count * 0.58);
  const tesseractCount = count - gimbalsCount;

  // 1. Three Massive Orthogonal Gimbal Rings (XY, YZ, XZ) with Volumetric Torus Thickness
  const perGimbal = Math.floor(gimbalsCount / 3);
  const R_gimbal = 128;
  const r_tube = 9.5;

  // Equatorial Ring (horizontal)
  pts.push(...sample3DTorus(0, 0, 0, R_gimbal, r_tube, perGimbal, 0, 0, 0));
  // Polar Ring 1 (tilted 60 deg)
  pts.push(...sample3DTorus(0, 0, 0, R_gimbal, r_tube, perGimbal, Math.PI / 3, 0.52, 0));
  // Polar Ring 2 (tilted -60 deg)
  pts.push(...sample3DTorus(0, 0, 0, R_gimbal, r_tube, gimbalsCount - perGimbal * 2, -Math.PI / 3, -0.52, 0));

  // 2. High-Tech 3D Tesseract / Nested Hypercube Power Core
  const S_out = 46;
  const S_in = 22;

  const outVerts = [];
  for (let ix of [-1, 1]) {
    for (let iy of [-1, 1]) {
      for (let iz of [-1, 1]) {
        outVerts.push({ x: ix * S_out, y: iy * S_out, z: iz * S_out });
      }
    }
  }

  const inVerts = outVerts.map(v => ({ x: v.x * (S_in / S_out), y: v.y * (S_in / S_out), z: v.z * (S_in / S_out) }));

  const cubeEdges = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  const totalLines = cubeEdges.length * 2 + 8;
  const perEdge = Math.floor(tesseractCount / totalLines);

  for (let [a, b] of cubeEdges) {
    pts.push(...sample3DLine(outVerts[a], outVerts[b], perEdge, 2.2));
  }
  for (let [a, b] of cubeEdges) {
    pts.push(...sample3DLine(inVerts[a], inVerts[b], perEdge, 1.5));
  }
  for (let i = 0; i < 8; i++) {
    const n = i === 7 ? (count - pts.length) : perEdge;
    pts.push(...sample3DLine(outVerts[i], inVerts[i], n, 1.8));
  }

  return pts;
}

// ─── 5. BRANDING: 3D Volumetric 3 Interlocking Circles (Venn Diagram Rings) ───
function generateBrandingShape(count) {
  const pts = [];
  const perRing = Math.floor(count / 3);

  // 3 Intertwined 3D Volumetric Torus Rings in consistent gold stardust:
  // Ring 1: Top
  // Ring 2: Bottom-Left
  // Ring 3: Bottom-Right
  const R = 74; // Major radius
  const rTube = 11.5; // Volumetric tube thickness

  const ringConfigs = [
    { cx: 0, cy: -46, cz: 10, rotX: 0.22, rotY: 0.0 },
    { cx: -52, cy: 44, cz: -8, rotX: -0.16, rotY: 0.26 },
    { cx: 52, cy: 44, cz: -8, rotX: -0.16, rotY: -0.26 },
  ];

  for (let rIdx = 0; rIdx < 3; rIdx++) {
    const cfg = ringConfigs[rIdx];
    const n = rIdx === 2 ? (count - pts.length) : perRing;
    const ringPts = sample3DTorus(cfg.cx, cfg.cy, cfg.cz, R, rTube, n, cfg.rotX, cfg.rotY, 0, null);
    pts.push(...ringPts);
  }

  return pts;
}

// ─── 6. SUPPORT: 3D Microsoft Defender Fortress Shield & 4 Quadrants ───
function generateSupportShape(count) {
  const pts = [];
  const W = 104; // Half-width
  const H_top = -105; // Top flat crest
  const H_bot = 125;  // Bottom tapered point
  const D = 28; // Forward 3D convex depth

  // 1. Microsoft Defender Outer Perimeter Contour:
  // Top flat edge, rounded shoulders, straight sides, smooth bottom taper to point
  const rimCount = Math.floor(count * 0.42);
  const segments = [
    // Top flat crest: (-68, H_top) to (68, H_top)
    { p1: { x: -68, y: H_top, z: D }, p2: { x: 68, y: H_top, z: D } },
    // Top-right rounded shoulder
    { p1: { x: 68, y: H_top, z: D }, p2: { x: 96, y: H_top + 34, z: D * 0.85 } },
    // Right straight vertical flank
    { p1: { x: 96, y: H_top + 34, z: D * 0.85 }, p2: { x: 96, y: 10, z: D * 0.65 } },
    // Right lower curve to bottom spear
    { p1: { x: 96, y: 10, z: D * 0.65 }, p2: { x: 0, y: H_bot, z: 0 } },
    // Bottom spear to Left lower curve
    { p1: { x: 0, y: H_bot, z: 0 }, p2: { x: -96, y: 10, z: D * 0.65 } },
    // Left straight vertical flank
    { p1: { x: -96, y: 10, z: D * 0.65 }, p2: { x: -96, y: H_top + 34, z: D * 0.85 } },
    // Top-left rounded shoulder
    { p1: { x: -96, y: H_top + 34, z: D * 0.85 }, p2: { x: -68, y: H_top, z: D } },
  ];

  const perSeg = Math.floor(rimCount / segments.length);
  for (let s of segments) {
    pts.push(...sample3DLine(s.p1, s.p2, perSeg, 3.5));
  }

  // 2. Microsoft Defender Iconic 4-Quadrant Dividing Cross (2x2 Divide):
  const crossCount = Math.floor(count * 0.22);
  // Vertical central spine beam
  const vTop = { x: 0, y: H_top, z: D + 4 };
  const vBot = { x: 0, y: H_bot, z: 6 };
  pts.push(...sample3DLine(vTop, vBot, Math.floor(crossCount * 0.55), 3.0));

  // Horizontal central cross beam
  const hLeft = { x: -94, y: 10, z: D * 0.65 + 4 };
  const hRight = { x: 94, y: 10, z: D * 0.65 + 4 };
  pts.push(...sample3DLine(hLeft, hRight, Math.floor(crossCount * 0.45), 3.0));

  // 3. Four Quadrant Facet Surface Panels (Dense Micro-Dot Arrays)
  const quadCount = count - pts.length;
  const perQuad = Math.floor(quadCount / 4);

  // Quadrant 1: Top-Left
  for (let i = 0; i < perQuad; i++) {
    const rx = -12 - Math.random() * 70;
    const ry = -12 - Math.random() * 78;
    const rz = D * (1.0 - Math.pow(rx / W, 2) * 0.4) + (Math.random() - 0.5) * 6;
    pts.push({ x: rx, y: ry, z: rz, intensity: 0.95 });
  }

  // Quadrant 2: Top-Right
  for (let i = 0; i < perQuad; i++) {
    const rx = 12 + Math.random() * 70;
    const ry = -12 - Math.random() * 78;
    const rz = D * (1.0 - Math.pow(rx / W, 2) * 0.4) + (Math.random() - 0.5) * 6;
    pts.push({ x: rx, y: ry, z: rz, intensity: 0.95 });
  }

  // Quadrant 3: Bottom-Left (tapers to bottom center)
  for (let i = 0; i < perQuad; i++) {
    const t = Math.random();
    const ry = 22 + t * 90;
    const maxW = (1.0 - t * 0.85) * 78;
    const rx = -8 - Math.random() * maxW;
    const rz = (1.0 - t) * D * 0.6 + (Math.random() - 0.5) * 6;
    pts.push({ x: rx, y: ry, z: rz, intensity: 0.95 });
  }

  // Quadrant 4: Bottom-Right (tapers to bottom center)
  const rem = count - pts.length;
  for (let i = 0; i < rem; i++) {
    const t = Math.random();
    const ry = 22 + t * 90;
    const maxW = (1.0 - t * 0.85) * 78;
    const rx = 8 + Math.random() * maxW;
    const rz = (1.0 - t) * D * 0.6 + (Math.random() - 0.5) * 6;
    pts.push({ x: rx, y: ry, z: rz, intensity: 0.95 });
  }

  return pts;
}

// ─── 7. GALAXY SWIRL / COSMIC VORTEX ───
function generateGalaxySwirlShape(count) {
  const pts = [];
  const coreCount = Math.floor(count * 0.18);
  for (let i = 0; i < coreCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 2.2) * 85;
    const z = (Math.random() - 0.5) * 55 * (1.0 - r / 85);
    pts.push({
      x: Math.cos(theta) * r,
      y: Math.sin(theta) * r,
      z: z,
      intensity: 0.98,
    });
  }

  const numArms = 5;
  const armsCount = Math.floor(count * 0.68);
  const perArm = Math.floor(armsCount / numArms);

  for (let a = 0; a < numArms; a++) {
    const armAngleOffset = (a / numArms) * Math.PI * 2;
    for (let i = 0; i < perArm; i++) {
      const t = i / (perArm - 1);
      const r = 35 + Math.pow(t, 1.25) * 545;
      const winding = 2.8 * Math.pow(t, 0.85);
      const theta = armAngleOffset + winding;
      const armScatter = (Math.random() - 0.5) * (18 + t * 45);
      const perpAngle = theta + Math.PI / 2;

      const px = Math.cos(theta) * r + Math.cos(perpAngle) * armScatter;
      const py = Math.sin(theta) * r + Math.sin(perpAngle) * armScatter;
      const z = (Math.random() - 0.5) * (40 * Math.sin(t * Math.PI) + 12);

      pts.push({
        x: px,
        y: py,
        z: z,
        intensity: 0.92,
      });
    }
  }

  const remaining = count - pts.length;
  for (let i = 0; i < remaining; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 60 + Math.random() * 520;
    const z = (Math.random() - 0.5) * 35;
    pts.push({
      x: Math.cos(theta) * r,
      y: Math.sin(theta) * r,
      z: z,
      intensity: 0.75,
    });
  }

  return pts;
}

// ─── 8. SPHERE: 3D Fibonacci Sphere ───
function generateSphereShape(count) {
  const pts = [];
  const radius = 135;
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1.0 - (2.0 * (i + 0.5)) / count);
    const theta = Math.PI * (1.0 + Math.sqrt(5.0)) * i;
    const rVar = radius * (0.84 + 0.16 * Math.sin(i * 11.7));
    pts.push({
      x: Math.sin(phi) * Math.cos(theta) * rVar,
      y: Math.cos(phi) * rVar,
      z: Math.sin(phi) * Math.sin(theta) * rVar,
      intensity: 0.96,
    });
  }
  return pts;
}

// ─── Public Shape Dispatcher ───
const SHAPE_GENERATORS = {
  web: generateWebShape,
  marketing: generateMarketingShape,
  social: generateSocialShape,
  automation: generateAutomationShape,
  branding: generateBrandingShape,
  support: generateSupportShape,
  circuit: generateGalaxySwirlShape,
  swirl: generateGalaxySwirlShape,
  galaxy: generateGalaxySwirlShape,
  sphere: generateSphereShape,
};

export function getShapePoints(serviceKey, count = 2040) {
  const gen = SHAPE_GENERATORS[serviceKey];
  if (!gen) return null;
  return gen(count);
}

/**
 * Assign each particle to its target 3D shape point with color support
 */
export function matchParticlesToShape(particles, targetPoints, centerX, centerY, scale = 1.0) {
  const n = Math.min(particles.length, targetPoints.length);

  for (let i = 0; i < n; i++) {
    const pt = targetPoints[i];
    particles[i].target3DX = (pt.x || 0) * scale;
    particles[i].target3DY = (pt.y || 0) * scale;
    particles[i].target3DZ = (pt.z || 0) * scale;
    particles[i].targetIntensity = pt.intensity !== undefined ? pt.intensity : 0.95;

    if (pt.color) {
      particles[i].targetR = pt.color[0];
      particles[i].targetG = pt.color[1];
      particles[i].targetB = pt.color[2];
    } else {
      particles[i].targetR = 0.85;
      particles[i].targetG = 0.68;
      particles[i].targetB = 0.42;
    }
  }

  // Any surplus particles disperse into ambient grid
  for (let i = n; i < particles.length; i++) {
    particles[i].target3DX = particles[i].homeX - centerX;
    particles[i].target3DY = particles[i].homeY - centerY;
    particles[i].target3DZ = 0;
    particles[i].targetIntensity = 0.2;
    particles[i].targetR = 0.85;
    particles[i].targetG = 0.68;
    particles[i].targetB = 0.42;
  }
}
