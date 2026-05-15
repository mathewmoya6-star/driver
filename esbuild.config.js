const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const isServe = process.argv.includes('--serve');

const config = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outdir: 'dist',
  sourcemap: true,
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
  },
  logLevel: 'info',
};

// Development server config
if (isServe) {
  esbuild.serve({
    servedir: 'dist',
    port: 3000,
  }, config).then(result => {
    console.log(`🚀 Server running at http://localhost:${result.port}`);
  }).catch(() => process.exit(1));
} 
// Build or watch mode
else if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('👀 Watching for changes...');
} 
// Production build
else {
  esbuild.build(config).catch(() => process.exit(1));
}
