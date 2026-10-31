import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      input: './index.html',
    },
  },
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: [
        /[\\/](laptop|3d modeli|\.vscode|dist|projekti slike)[\\/]/i,
        /\.(glb|gltf|zip|mp4|bin)$/i,
        '**/laptop/**',
        '**/3d modeli/**',
        '**/projekti slike/**',
        '**/*.glb',
        '**/*.gltf',
        '**/*.zip',
        '**/*.mp4',
        '**/.vscode/**',
      ],
    },
  },
});
