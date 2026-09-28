/**
 * Resize hero frames to 1280x720 WebP for optimal scroll performance.
 * Uses ffmpeg-static.
 * 
 * Usage: node scripts/resize-frames.cjs
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = require('ffmpeg-static');
const inputDir = path.resolve(__dirname, '..', 'public', 'frames', 'hero');
const outputDir = path.resolve(__dirname, '..', 'public', 'frames', 'hero-720');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Resizing frames to 1280x720 WebP...');
console.log(`Input:  ${inputDir}`);
console.log(`Output: ${outputDir}`);
console.log();

// Get list of JPG frames
const frames = fs.readdirSync(inputDir)
  .filter(f => f.endsWith('.jpg'))
  .sort();

let totalSize = 0;
let count = 0;

for (const frame of frames) {
  const inputFile = path.join(inputDir, frame);
  const outputFile = path.join(outputDir, frame.replace('.jpg', '.webp'));

  const cmd = [
    `"${ffmpegPath}"`,
    `-y -loglevel error`,
    `-i "${inputFile}"`,
    `-vf scale=1280:720`,
    `-quality 80`,          // WebP quality
    `"${outputFile}"`,
  ].join(' ');

  try {
    execSync(cmd);
    const stats = fs.statSync(outputFile);
    totalSize += stats.size;
    count++;
    process.stdout.write(`\r  Processed ${count}/${frames.length}`);
  } catch (err) {
    console.error(`\n  Failed: ${frame} — ${err.message}`);
  }
}

const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
const avgKB = Math.round(totalSize / count / 1024);
console.log(`\n\n✓ Done! ${count} frames converted.`);
console.log(`  Total size: ${totalMB} MB (avg ${avgKB} KB/frame)`);
