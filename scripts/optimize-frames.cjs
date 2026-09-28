/**
 * Create optimized 1080p WebP frames from existing hero-1080 JPGs.
 * Takes every other frame (odd-numbered) for ~100 frames total.
 * 
 * Usage: node scripts/optimize-frames.cjs
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = require('ffmpeg-static');
const inputDir = path.resolve(__dirname, '..', 'public', 'frames', 'hero-1080');
const outputDir = path.resolve(__dirname, '..', 'public', 'frames', 'hero-opt');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Creating optimized 1080p WebP frames (every other frame)...');
console.log(`Input:  ${inputDir}`);
console.log(`Output: ${outputDir}`);
console.log();

// Get all source JPG frames sorted
const allFrames = fs.readdirSync(inputDir)
  .filter(f => f.endsWith('.jpg'))
  .sort();

console.log(`Source frames: ${allFrames.length}`);

// Take every other frame (odd indices: 1, 3, 5, ...)
const selectedFrames = allFrames.filter((_, i) => i % 2 === 0);
console.log(`Selected frames: ${selectedFrames.length}`);
console.log();

let totalSize = 0;
let count = 0;

for (let i = 0; i < selectedFrames.length; i++) {
  const frame = selectedFrames[i];
  const inputFile = path.join(inputDir, frame);
  // Sequential naming: frame_001.webp, frame_002.webp, ...
  const outName = `frame_${String(i + 1).padStart(3, '0')}.webp`;
  const outputFile = path.join(outputDir, outName);

  const cmd = [
    `"${ffmpegPath}"`,
    `-y -loglevel error`,
    `-i "${inputFile}"`,
    `-vf scale=1600:900`,
    `-c:v libwebp`,
    `-quality 80`,
    `-preset photo`,
    `"${outputFile}"`,
  ].join(' ');

  try {
    execSync(cmd);
    const stats = fs.statSync(outputFile);
    totalSize += stats.size;
    count++;
    process.stdout.write(`\r  Processed ${count}/${selectedFrames.length}`);
  } catch (err) {
    console.error(`\n  Failed: ${frame} — ${err.message}`);
  }
}

const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
const avgKB = Math.round(totalSize / count / 1024);
console.log(`\n\n✓ Done! ${count} frames created.`);
console.log(`  Total size: ${totalMB} MB (avg ${avgKB} KB/frame)`);
console.log(`  Output: ${outputDir}`);
