// Quick script to sample the corner pixel color of frame_121.png
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  // Sample corners
  const corners = [
    { name: 'top-left', x: 5, y: 5 },
    { name: 'top-right', x: img.naturalWidth - 5, y: 5 },
    { name: 'bottom-left', x: 5, y: img.naturalHeight - 5 },
    { name: 'bottom-right', x: img.naturalWidth - 5, y: img.naturalHeight - 5 },
  ];
  corners.forEach(c => {
    const [r, g, b] = ctx.getImageData(c.x, c.y, 1, 1).data;
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    console.log(`${c.name}: rgb(${r},${g},${b}) = ${hex}`);
  });
};
img.src = '/frames/hero/frame_121.jpg';
