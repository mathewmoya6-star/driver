import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch');
const isServe = process.argv.includes('--serve');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy public files to dist
if (fs.existsSync('public')) {
  const files = fs.readdirSync('public');
  files.forEach(file => {
    fs.copyFileSync(path.join('public', file), path.join('dist', file));
  });
}

const config = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/index.js',
  sourcemap: isWatch,
  minify: !isWatch,
  target: ['es2020', 'chrome58', 'firefox57', 'safari11'],
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.svg': 'file',
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
  },
  logLevel: 'info',
  banner: {
    js: '// MEI DRIVE AFRICA - Built with esbuild',
  },
};

if (isServe) {
  // Development server with hot reload
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
  ║  🎨 Framework: React + TypeScript                         ║
  ╚══════════════════════════════════════════════════════════╝
  `);
} else if (isWatch) {
  // Watch mode
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('👀 Watching for changes... Press Ctrl+C to stop');
} else {
  // Production build
  esbuild.build(config).then(() => {
    console.log(`
  ✅ Production build complete!
  📁 Output: dist/
  📦 Bundle size: ${fs.statSync('dist/index.js').size / 1024} KB
  `);
  }).catch(() => process.exit(1));
}
