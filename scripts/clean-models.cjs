const fs = require('fs');
const path = require('path');

function removeLogosFromGlb(inputPath, outputPath, transformFn) {
  console.log(`\nProcessing: ${path.basename(inputPath)}...`);
  const buf = fs.readFileSync(inputPath);

  // 1. Validate header
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    throw new Error('Not a glTF file');
  }
  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);

  // 2. Read Chunk 0 (JSON)
  const jsonChunkLength = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16);
  if (jsonChunkType !== 0x4E4F534A) {
    throw new Error('First chunk is not JSON');
  }
  const jsonRawStr = buf.toString('utf8', 20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonRawStr);

  // 3. Read Chunk 1 (BIN)
  const binHeaderOffset = 20 + jsonChunkLength;
  let binChunkLength = 0;
  let binChunkType = 0;
  let binData = Buffer.alloc(0);

  if (binHeaderOffset < totalLength) {
    binChunkLength = buf.readUInt32LE(binHeaderOffset);
    binChunkType = buf.readUInt32LE(binHeaderOffset + 4);
    binData = buf.subarray(binHeaderOffset + 8, binHeaderOffset + 8 + binChunkLength);
  }

  // 4. Transform glTF JSON
  transformFn(gltf);

  // 5. Serialize new JSON and pad to 4-byte boundary with spaces (0x20)
  let newJsonStr = JSON.stringify(gltf);
  let newJsonBuffer = Buffer.from(newJsonStr, 'utf8');
  const jsonPadding = (4 - (newJsonBuffer.length % 4)) % 4;
  if (jsonPadding > 0) {
    const pad = Buffer.alloc(jsonPadding, 0x20); // space padding
    newJsonBuffer = Buffer.concat([newJsonBuffer, pad]);
  }
  const newJsonChunkLength = newJsonBuffer.length;

  // 6. Ensure BIN chunk is padded to 4-byte boundary with zeros (0x00)
  const binPadding = (4 - (binData.length % 4)) % 4;
  if (binPadding > 0) {
    const pad = Buffer.alloc(binPadding, 0x00);
    binData = Buffer.concat([binData, pad]);
    binChunkLength = binData.length;
  }

  // 7. Calculate new total length
  const newTotalLength = 12 + (8 + newJsonChunkLength) + (binData.length > 0 ? (8 + binChunkLength) : 0);

  // 8. Assemble new GLB file
  const outBuf = Buffer.alloc(newTotalLength);
  // Header
  outBuf.writeUInt32LE(0x46546c67, 0); // magic
  outBuf.writeUInt32LE(version, 4);    // version
  outBuf.writeUInt32LE(newTotalLength, 8);

  // Chunk 0 (JSON)
  outBuf.writeUInt32LE(newJsonChunkLength, 12);
  outBuf.writeUInt32LE(0x4E4F534A, 16); // 'JSON'
  newJsonBuffer.copy(outBuf, 20);

  // Chunk 1 (BIN)
  let currentOffset = 20 + newJsonChunkLength;
  if (binData.length > 0) {
    outBuf.writeUInt32LE(binChunkLength, currentOffset);
    outBuf.writeUInt32LE(0x004E4942, currentOffset + 4); // 'BIN\0'
    binData.copy(outBuf, currentOffset + 8);
  }

  fs.writeFileSync(outputPath, outBuf);
  console.log(`Saved clean model to: ${outputPath} (${outBuf.length} bytes)`);
}

// --- Backup & Clean iPhone ---
const iphonePath = path.join(__dirname, '../public/models/apple_iphone_15_pro_max_black.glb');
const iphoneBackup = path.join(__dirname, '../public/models/apple_iphone_15_pro_max_black.original.glb');
if (!fs.existsSync(iphoneBackup)) {
  fs.copyFileSync(iphonePath, iphoneBackup);
  console.log(`Backed up original iPhone to ${iphoneBackup}`);
}

removeLogosFromGlb(iphoneBackup, iphonePath, (gltf) => {
  // Remove Apple logo nodes 60 & 61
  // Node 58 -> children [59, 62, 70]
  if (gltf.nodes[58] && gltf.nodes[58].children) {
    gltf.nodes[58].children = gltf.nodes[58].children.filter(c => c !== 59);
    console.log('Removed Node 59 (Apple logo parent) from Node 58 children');
  }

  // Clear children of Node 59
  if (gltf.nodes[59]) {
    gltf.nodes[59].children = [];
    gltf.nodes[59].scale = [0, 0, 0];
  }

  // De-mesh and zero-scale Node 60 (TakBsdEjEytCAMK)
  if (gltf.nodes[60]) {
    delete gltf.nodes[60].mesh;
    gltf.nodes[60].scale = [0, 0, 0];
    gltf.nodes[60].translation = [0, -100, 0];
    console.log('Eliminated Node 60 (Apple logo part 1)');
  }

  // De-mesh and zero-scale Node 61 (IykfmVvLplTsTEW)
  if (gltf.nodes[61]) {
    delete gltf.nodes[61].mesh;
    gltf.nodes[61].scale = [0, 0, 0];
    gltf.nodes[61].translation = [0, -100, 0];
    console.log('Eliminated Node 61 (Apple logo part 2)');
  }
});

// --- Backup & Clean Laptop ---
const laptopPath = path.join(__dirname, '../public/models/gaming_laptop.glb');
const laptopBackup = path.join(__dirname, '../public/models/gaming_laptop.original.glb');
if (!fs.existsSync(laptopBackup)) {
  fs.copyFileSync(laptopPath, laptopBackup);
  console.log(`Backed up original Laptop to ${laptopBackup}`);
}

removeLogosFromGlb(laptopBackup, laptopPath, (gltf) => {
  // 1. Remove Alienware logo from Lid (Node 17, Mesh 12, Material.008)
  if (gltf.nodes[12] && gltf.nodes[12].children) {
    gltf.nodes[12].children = gltf.nodes[12].children.filter(c => c !== 17);
    console.log('Removed Node 17 (Alienware lid logo) from Node 12 children');
  }
  if (gltf.nodes[17]) {
    delete gltf.nodes[17].mesh;
    gltf.nodes[17].scale = [0, 0, 0];
    gltf.nodes[17].translation = [0, -100, 0];
    console.log('Eliminated Node 17 (Alienware lid logo)');
  }

  // 2. Remove Alienware Alien Power Button from Keyboard Base (Node 9 & 10)
  if (gltf.nodes[3] && gltf.nodes[3].children) {
    gltf.nodes[3].children = gltf.nodes[3].children.filter(c => c !== 9 && c !== 10);
    console.log('Removed Node 9 & 10 (Alienware power button) from Node 3 children');
  }
  if (gltf.nodes[9]) {
    delete gltf.nodes[9].mesh;
    gltf.nodes[9].scale = [0, 0, 0];
    gltf.nodes[9].translation = [0, -100, 0];
    console.log('Eliminated Node 9 (Alienware power button outer)');
  }
  if (gltf.nodes[10]) {
    delete gltf.nodes[10].mesh;
    gltf.nodes[10].scale = [0, 0, 0];
    gltf.nodes[10].translation = [0, -100, 0];
    console.log('Eliminated Node 10 (Alienware power button inner)');
  }
});

console.log('\nAll logos successfully removed!');
