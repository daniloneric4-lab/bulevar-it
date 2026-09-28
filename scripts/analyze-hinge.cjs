const fs = require('fs');
const path = require('path');

// Let's verify the exact hinge line
// Cube.001_1 (Base):
// Mesh 0-7:
// Mesh 0: Min [-0.391,-0.074,-1.983], Max [0.004,0,1.983]
// Mesh 4: Min [-2.563,-0.07,-1.983], Max [-0.189,0,1.983]
// The base extends from X = -2.56 to X = 0.
// Cube.003_2 (Lid):
// Mesh 8: Min [-1.2,-0.131,-2], Max [1.341,0.125,2.003]
// Notice that the lid's center is around X = 0.07!
// The hinge between base and lid is around X = -1.2, Y = 0.09!
// When the lid is OPEN (as in the original model):
// It is standing upright at roughly X = -1.2 to 0!
// When the lid is CLOSED:
// It should rotate down flat against the base (towards -X)!
console.log('Hinge analysis ready');
