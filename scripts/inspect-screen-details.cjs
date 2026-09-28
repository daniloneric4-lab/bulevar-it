const fs = require('fs');
const path = require('path');

function inspectScreens() {
  // 1. Laptop
  const laptopBuf = fs.readFileSync(path.join(__dirname, '../public/models/gaming_laptop.glb'));
  const laptopLen = laptopBuf.readUInt32LE(12);
  const laptopGltf = JSON.parse(laptopBuf.toString('utf8', 20, 20 + laptopLen));
  console.log('=== LAPTOP SCREEN MESH ===');
  // Look at materials
  laptopGltf.materials.forEach((m, i) => {
    if (m.name === 'Material.004' || m.name === 'Material.010' || m.name === 'Material.007') {
      console.log(`Laptop Mat ${i} "${m.name}": baseTex=${m.pbrMetallicRoughness?.baseColorTexture?.index}, emissive=${JSON.stringify(m.emissiveFactor)}`);
    }
  });

  // 2. iPhone
  const iphoneBuf = fs.readFileSync(path.join(__dirname, '../public/models/apple_iphone_15_pro_max_black.glb'));
  const iphoneLen = iphoneBuf.readUInt32LE(12);
  const iphoneGltf = JSON.parse(iphoneBuf.toString('utf8', 20, 20 + iphoneLen));
  console.log('=== IPHONE SCREEN MESH ===');
  // Mat 31, 34, 18
  iphoneGltf.materials.forEach((m, i) => {
    if (m.emissiveFactor || (m.name && /screen|display|hiVunn|pIJK/i.test(m.name))) {
      console.log(`iPhone Mat ${i} "${m.name}": baseTex=${m.pbrMetallicRoughness?.baseColorTexture?.index}, emissive=${JSON.stringify(m.emissiveFactor)}`);
    }
  });

  // Find which node uses Mat 34 or Mat 18
  iphoneGltf.nodes.forEach((n, i) => {
    if (n.mesh !== undefined) {
      const mesh = iphoneGltf.meshes[n.mesh];
      mesh.primitives.forEach(p => {
        if (p.material === 34 || p.material === 18) {
          console.log(`iPhone Node ${i} ("${n.name}") -> Mesh ${n.mesh} -> Mat ${p.material} (${iphoneGltf.materials[p.material]?.name})`);
        }
      });
    }
  });
}

inspectScreens();
