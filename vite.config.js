import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: './index.html',
        lpZastoSajt: './lp/zasto-sajt/index.html',
        lpNeTrazimo: './lp/ne-trazimo/index.html',
        lpStaAko: './lp/sta-ako/index.html',
        politikaPrivatnosti: './politika-privatnosti/index.html',
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    open: false,
    watch: {
      ignored: [
        '**/kljuc.html',
        '**/kontakt-final.html',
        '**/radovi-prototip.html',
        '**/put-kupca-v3.html',
        '**/Own your customer journey.html',
        '**/sistem-uloga.html',
        '**/kako-razmisljamo.html',
        '**/ideje-usluge.html',
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
        '**/_backup_pre_ideje/**',
      ],
    },
  },
});
