const THREE = require('three');

// Let's analyze the raw GLTF model geometry:
// Hinge is at H = [-1.1986, 0.0959, 0]
// Screen (Node 12) extends from H to S_top = [1.34, 0.10, 0]:
// Vector along screen = S_top - H = [2.54, 0, 0] -> along +X!
// Screen face normal (where pixels are) = +Y or -Y? Let's check!

// Keyboard (Node 3):
// Extends from H to KB_front.
// In the script above, keyboard center was [-1.495, 1.518, 0].
// Vector from H to KB center = [-0.30, 1.42, 0] -> predominantly +Y!

// Let's verify what the laptop looks like when:
// 1. Keyboard is flat on the desk facing viewer:
// We want keyboard to extend from hinge towards viewer (+Z) or down.
// 2. Screen stands upright facing viewer:
// We want screen to extend from hinge UP (+Y).
// And screen normal should face VIEWER (+Z)!

// Let's check which side of the screen has the display pixels:
// We already know Mesh 11 (the original display) is at Y = +0.08.
// And Object_13 (the back shell) is at Y = -0.13.
// So the DISPLAY is on the POSITIVE Y (+Y) side of Node 12!
// And the BACK SHELL is on the NEGATIVE Y (-Y) side of Node 12!
// Therefore:
// When the screen stands upright:
// Screen direction (from hinge to top of screen) should be UP (+Y in world).
// Screen display normal (pointing out of the pixels) should be TOWARDS VIEWER (+Z in world)!

console.log('Display is on +Y side of Node 12.');
console.log('Back shell is on -Y side of Node 12.');
