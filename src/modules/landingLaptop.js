import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Shared 3D laptop helper for landing pages (/lp/zasto-sajt, /lp/ne-trazimo, /lp/sta-ako)
 * - Renders immediately with procedural mesh (zero pop-in/lag)
 * - Upgrades asynchronously to /models/laptop.glb once loaded
 * - Controls lid opening, laptop rotation/floating, and canvas texture
 */
export function createLandingLaptop({
  host,
  canvas,
  initialLidAngle = -1.894,
  cameraZ = 8.0,
  cameraY = 1.3,
  lookAtY = 0.5,
  fov = 28
}) {
  let isGLTF = false;
  let currentLidAngle = initialLidAngle;

  const R3 = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  R3.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  host.appendChild(R3.domElement);
  R3.outputColorSpace = THREE.SRGBColorSpace;

  const S = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);

  S.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dl = new THREE.DirectionalLight(0xffffff, 0.85);
  dl.position.set(3, 6, 5);
  S.add(dl);
  const rim = new THREE.PointLight(0xD9B25F, 1.1, 14);
  rim.position.set(-3, 2, -2);
  S.add(rim);

  const lap = new THREE.Group();
  S.add(lap);

  // Canvas texture with high-fidelity filtering
  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = R3.capabilities.getMaxAnisotropy();
  tex.colorSpace = THREE.SRGBColorSpace;

  // 1. Procedural laptop (appears immediately, zero delay)
  const LW = 3.3, LD = 2.25, BH = 0.11, LH = 2.12, LT = 0.06;
  const metal = new THREE.MeshStandardMaterial({ color: 0x1C2234, metalness: 0.6, roughness: 0.42 });

  const procBase = new THREE.Mesh(new THREE.BoxGeometry(LW, BH, LD), metal);
  lap.add(procBase);

  // Keyboard
  const kc = document.createElement('canvas');
  kc.width = 1024; kc.height = 700;
  const k = kc.getContext('2d');
  k.fillStyle = '#141927'; k.fillRect(0, 0, 1024, 700);
  for (let r = 0; r < 6; r++) {
    for (let q = 0; q < 14; q++) {
      k.fillStyle = '#0D1120';
      k.beginPath();
      k.roundRect ? k.roundRect(40 + q * 68, 40 + r * 60, 58, 50, 8) : k.rect(40 + q * 68, 40 + r * 60, 58, 50);
      k.fill();
    }
  }
  k.fillStyle = '#0D1120'; k.fillRect(260, 420, 500, 50);
  k.fillStyle = '#151A2A'; k.beginPath();
  k.roundRect ? k.roundRect(340, 500, 340, 170, 14) : k.rect(340, 500, 340, 170); k.fill();

  const kbTex = new THREE.CanvasTexture(kc);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(LW * 0.94, LD * 0.9), new THREE.MeshStandardMaterial({ map: kbTex, metalness: 0.3, roughness: 0.7 }));
  kb.rotation.x = -Math.PI / 2;
  kb.position.y = BH / 2 + 0.002;
  lap.add(kb);

  // Hinge & Lid
  const hinge = new THREE.Group();
  hinge.position.set(0, BH / 2, -LD / 2 + 0.02);
  hinge.rotation.x = initialLidAngle;
  lap.add(hinge);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(LW, LH, LT), metal);
  lid.position.y = LH / 2;
  hinge.add(lid);

  const bez = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.06, LH - 0.06), new THREE.MeshBasicMaterial({ color: 0x05070D }));
  bez.position.set(0, LH / 2, LT / 2 + 0.001);
  hinge.add(bez);

  const scr = new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.2, (LW - 0.2) * 800 / 1280), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.set(0, LH / 2 + 0.02, LT / 2 + 0.002);
  hinge.add(scr);

  // Soft contact shadow
  const shd = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({
    transparent: true, depthWrite: false, map: (() => {
      const g = document.createElement('canvas'); g.width = g.height = 256; const x = g.getContext('2d');
      const r = x.createRadialGradient(128, 128, 10, 128, 128, 128);
      r.addColorStop(0, 'rgba(0,0,0,0.55)'); r.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = r; x.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(g);
    })()
  }));
  shd.rotation.x = -Math.PI / 2;
  shd.position.y = -BH / 2 - 0.01;
  lap.add(shd);

  const hingeRef = { obj: hinge };

  // 2. Asynchronously load /models/laptop.glb and upgrade smoothly
  const loader = new GLTFLoader();
  loader.load('/models/laptop.glb', (gltf) => {
    const model = gltf.scene;
    let origMesh = null;
    model.traverse((child) => {
      if (child.isMesh && (child.name === 'Laptop_Laptop1_0' || !origMesh)) origMesh = child;
    });
    if (!origMesh) return;

    if (origMesh.material) {
      origMesh.material.side = THREE.DoubleSide;
      if (origMesh.material.map) {
        origMesh.material.map.colorSpace = THREE.SRGBColorSpace;
        origMesh.material.map.generateMipmaps = true;
        origMesh.material.map.minFilter = THREE.LinearMipmapLinearFilter;
        origMesh.material.map.magFilter = THREE.LinearFilter;
        origMesh.material.map.anisotropy = R3.capabilities.getMaxAnisotropy();
      }
    }

    const origGeo = origMesh.geometry;
    const posAttr = origGeo.attributes.position;
    const indexAttr = origGeo.index;
    const baseIndices = [];
    const lidIndices = [];
    const splitY = 1.2;

    for (let i = 0; i < indexAttr.count; i += 3) {
      const i0 = indexAttr.getX(i), i1 = indexAttr.getX(i + 1), i2 = indexAttr.getX(i + 2);
      const avgY = (posAttr.getY(i0) + posAttr.getY(i1) + posAttr.getY(i2)) / 3;
      if (avgY > splitY) lidIndices.push(i0, i1, i2);
      else baseIndices.push(i0, i1, i2);
    }

    const baseGeo = new THREE.BufferGeometry();
    baseGeo.setAttribute('position', origGeo.attributes.position);
    baseGeo.setAttribute('normal', origGeo.attributes.normal);
    baseGeo.setAttribute('uv', origGeo.attributes.uv);
    baseGeo.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(baseIndices), 1));

    const lidGeo = new THREE.BufferGeometry();
    lidGeo.setAttribute('position', origGeo.attributes.position);
    lidGeo.setAttribute('normal', origGeo.attributes.normal);
    lidGeo.setAttribute('uv', origGeo.attributes.uv);
    lidGeo.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(lidIndices), 1));

    const gltfBase = new THREE.Mesh(baseGeo, origMesh.material);
    const gltfLid = new THREE.Mesh(lidGeo, origMesh.material);

    const gltfHingePivot = new THREE.Group();
    gltfHingePivot.position.set(0, 1.0, 0);
    gltfLid.position.set(0, -1.0, 0);
    gltfHingePivot.add(gltfLid);

    // Screen quad directly on bezel
    const nY = 0.04 * 0.3168, nZ = -0.04 * 0.9485;
    const screenPositions = new Float32Array([
      -17.176, 22.089 + nY, 6.977 + nZ,
       17.176, 22.089 + nY, 6.977 + nZ,
       17.176,  3.761 + nY, 0.856 + nZ,
      -17.176,  3.761 + nY, 0.856 + nZ,
    ]);
    const screenUVs = new Float32Array([1, 1, 0, 1, 0, 0, 1, 0]);
    const screenIndices = new Uint16Array([0, 3, 1, 1, 3, 2, 0, 1, 3, 1, 2, 3]);
    const screenGeo = new THREE.BufferGeometry();
    screenGeo.setAttribute('position', new THREE.BufferAttribute(screenPositions, 3));
    screenGeo.setAttribute('uv', new THREE.BufferAttribute(screenUVs, 2));
    screenGeo.setIndex(new THREE.BufferAttribute(screenIndices, 1));
    screenGeo.computeVertexNormals();

    const gltfScreen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide }));
    gltfHingePivot.add(gltfScreen);

    const gltfContainer = new THREE.Group();
    const scModel = 3.3 / 34.352;
    gltfContainer.scale.set(scModel, scModel, scModel);
    gltfContainer.rotation.set(0, Math.PI, 0);
    gltfContainer.position.set(0, 0, 0);
    gltfContainer.add(gltfBase);
    gltfContainer.add(gltfHingePivot);

    // Swap procedural meshes with high-def GLTF model
    isGLTF = true;
    lap.remove(procBase);
    lap.remove(kb);
    lap.remove(hinge);

    // Synchronize current hinge rotation angle
    gltfHingePivot.rotation.x = currentLidAngle;
    lap.add(gltfContainer);
    hingeRef.obj = gltfHingePivot;
  });

  function setLidAngle(ang) {
    currentLidAngle = ang;
    if (hingeRef.obj) {
      hingeRef.obj.rotation.x = isGLTF ? ang : -ang;
    }
  }

  setLidAngle(initialLidAngle);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    R3.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  return {
    scene: S,
    camera: cam,
    renderer: R3,
    laptop: lap,
    texture: tex,
    setLidAngle,
    getHinge: () => hingeRef.obj,
    resize
  };
}
