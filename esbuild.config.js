import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';
const isWatch = process.argv.includes('--watch');
const isServe = process.argv.includes('--serve');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy public files
if (fs.existsSync('public')) {
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  copyDir('public', 'dist');
}

// Copy index.html
if (fs.existsSync('index.html')) {
  fs.copyFileSync('index.html', 'dist/index.html');
}

const config = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/index.js',
  sourcemap: isDev,
  minify: !isDev,
  target: ['es2020', 'chrome58', 'firefox57', 'safari11'],
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
    '.webp': 'file',
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || (isDev ? 'development' : 'production')),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_APP_NAME': JSON.stringify(process.env.VITE_APP_NAME),
    'import.meta.env.VITE_APP_URL': JSON.stringify(process.env.VITE_APP_URL),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
  logLevel: 'info',
  splitting: true,
  format: 'esm',
  assetNames: 'assets/[name]-[hash]',
  chunkNames: 'chunks/[name]-[hash]',
  metafile: true,
};

if (isServe) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  
  const { host, port } = await ctx.serve({
    servedir: 'dist',
    port: 3000,
    host: 'localhost',
  });
  
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║     🚗 MEI DRIVE AFRICA - Development Server            ║
  ╠══════════════════════════════════════════════════════════╣
  ║  📍 Local:    http://${host}:${port}                        ║
  ║  🔥 Hot reload: Enabled                                   ║
  ║  📦 Bundler: esbuild                                      ║
  ║  🎨 Mode: Development                                     ║
  ╚══════════════════════════════════════════════════════════╝
  `);
} else if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('👀 Watching for changes... Press Ctrl+C to stop');
} else {
  const result = await esbuild.build(config);
  console.log(`
  ✅ Production build complete!
  📁 Output: dist/
  📦 Bundle size: ${fs.statSync('dist/index.js').size / 1024} KB
  `);
}
