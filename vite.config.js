import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'src',
    base: './', // Use relative paths for GitHub Pages
    publicDir: '../public',
    build: {
        outDir: '../docs', // GitHub Pages can serve from /docs folder
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html')
            }
        }
    },
    server: {
        host: true,
        port: 5173
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});
