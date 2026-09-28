/**
 * convert-to-video.js
 * Converts the hero frame sequence (JPGs) into an MP4 video
 * optimised for scroll-scrubbing (all keyframes for instant seeking).
 * 
 * Usage: node scripts/convert-to-video.js
 */
const { execSync } = require('child_process');
const path = require('path');

// Resolve ffmpeg binary from ffmpeg-static
let ffmpegPath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch {
  console.error('ffmpeg-static not found. Run: npm install --save-dev ffmpeg-static');
  process.exit(1);
}

const framesDir = path.resolve(__dirname, '..', 'public', 'frames', 'hero');
const outputFile = path.resolve(__dirname, '..', 'public', 'hero-scroll.mp4');

// Build ffmpeg command:
// - Input: frame_001.jpg to frame_121.jpg at 30fps
// - Codec: H.264 with ALL keyframes (keyint=1) for instant seeking
// - CRF 18: high quality, reasonable file size
// - faststart: moov atom at beginning for immediate playback
// - pix_fmt yuv420p: max browser compatibility
const cmd = [
  `"${ffmpegPath}"`,
  `-y`,                                    // Overwrite output
  `-framerate 30`,                         // Input framerate
  `-i "${path.join(framesDir, 'frame_%03d.jpg')}"`,  // Input pattern
  `-c:v libx264`,                          // H.264 codec
  `-preset slow`,                          // Better compression
  `-crf 18`,                               // High quality
  `-g 1`,                                  // Every frame is a keyframe (instant seeking!)
  `-pix_fmt yuv420p`,                      // Browser compatibility
  `-movflags +faststart`,                  // Streaming-friendly
  `-an`,                                   // No audio
  `"${outputFile}"`,
].join(' ');

console.log('Converting frames to video...');
console.log(`Input:  ${framesDir}/frame_*.jpg`);
console.log(`Output: ${outputFile}`);
console.log();

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('\n✓ Video created successfully!');
  
  // Show file size
  const fs = require('fs');
  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`  Size: ${sizeMB} MB`);
} catch (err) {
  console.error('✗ FFmpeg conversion failed:', err.message);
  process.exit(1);
}
