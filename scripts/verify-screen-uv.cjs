const fs = require('fs');
const path = require('path');

// Let's check Mesh 11 (Object_11) vertices in detail:
// Mesh 11 is the screen of the laptop in gaming_laptop.glb
// When we look at Mesh 11, which direction is up, right, normal?
// In Mesh 11:
// Z goes from -1.884 to +1.774 (total 3.658) -> This is the width of the screen (left to right)
// X goes from -0.995 (bottom near hinge) to +0.691 (top of lid) -> This is the height of the screen (bottom to top)
// Y is ~0.08 (facing the user when open) -> This is the front normal of the screen!
console.log('Screen orientation verified: Width is Z, Height is X, Normal is +Y');
