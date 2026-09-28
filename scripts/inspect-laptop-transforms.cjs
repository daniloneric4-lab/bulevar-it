const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, '../public/models/gaming_laptop.glb'));
const len = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + len));

console.log('Node 12 (Cube.003_2):', JSON.stringify({
  translation: gltf.nodes[12].translation,
  rotation: gltf.nodes[12].rotation,
  scale: gltf.nodes[12].scale,
  matrix: gltf.nodes[12].matrix
}, null, 2));

console.log('Node 3 (Cube.001_1):', JSON.stringify({
  translation: gltf.nodes[3].translation,
  rotation: gltf.nodes[3].rotation,
  scale: gltf.nodes[3].scale,
  matrix: gltf.nodes[3].matrix
}, null, 2));
