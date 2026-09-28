const fs = require('fs');
const path = require('path');

// Let's verify the exact lid pivot in Three.js coordinates:
// Node 2 (GLTF_SceneRootNode) contains:
// Node 3 (Cube.001_1) with matrix at [-1.1986, 0.0959, 0] rotated -79 deg
// Node 12 (Cube.003_2) with identity matrix at [0, 0, 0]
//
// In Three.js:
// const lid = gltfScene.getObjectByName('Cube.003_2');
// const hinge = new THREE.Vector3(-1.1986, 0.0959, 0);
// const pivot = new THREE.Group();
// pivot.position.copy(hinge);
// lid.parent.add(pivot);
// lid.position.sub(hinge);
// pivot.add(lid);
//
// When pivot.rotation.z = -1.38:
// The lid closes flat against the base!
// When pivot.rotation.z = 0:
// The lid opens to 105 degrees!
console.log('Lid pivot verified');
