const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, '../public/models/gaming_laptop.glb'));
const len = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.toString('utf8', 20, 20 + len));

console.log('--- MESH 8 (Lid body) Accessor: ---');
const prim8 = gltf.meshes[8].primitives[0];
const pos8 = gltf.accessors[prim8.attributes.POSITION];
console.log('min:', pos8.min, 'max:', pos8.max);

console.log('--- MESH 11 (Screen) Accessor: ---');
const prim11 = gltf.meshes[11].primitives[0];
const pos11 = gltf.accessors[prim11.attributes.POSITION];
console.log('min:', pos11.min, 'max:', pos11.max);

console.log('--- MESH 0 (Base edge) Accessor: ---');
const prim0 = gltf.meshes[0].primitives[0];
const pos0 = gltf.accessors[prim0.attributes.POSITION];
console.log('min:', pos0.min, 'max:', pos0.max);
