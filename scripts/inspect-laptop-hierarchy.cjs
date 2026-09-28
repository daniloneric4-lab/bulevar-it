const fs = require('fs');
const path = require('path');
const THREE = require('three');

// In Node without DOM, GLTFLoader can parse if we mock or use gltf json directly
const buf = fs.readFileSync(path.join(__dirname, '../public/models/gaming_laptop.glb'));
const len = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + len));

console.log('Nodes in gaming_laptop.glb:');
gltf.nodes.forEach((n, i) => {
  console.log(`Node ${i}: "${n.name}" | mesh: ${n.mesh} | children: ${JSON.stringify(n.children)} | translation: ${JSON.stringify(n.translation)} | rotation: ${JSON.stringify(n.rotation)}`);
});
