import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

// Build React app with esbuild
await esbuild.build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    outfile: 'dist/bundle.js',
    platform: 'browser',
    format: 'iife',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    loader: { '.jsx': 'jsx', '.js': 'jsx' },
    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || 'https://jeksrwrzzrczamxijvwl.supabase.co'),
        'process.env.SUPABASE_KEY': JSON.stringify(process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impla3Nyd3J6enJjemFteGlqdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzYyMjAsImV4cCI6MjA5NDI1MjIyMH0.1poYpJKNFEVe2NTBkXBTH2bIHGk2yT8aqCU-OlJc4vs')
    },
    minify: true,
    sourcemap: false,
    target: ['es2020', 'chrome58', 'edge16', 'firefox57', 'safari11']
}).catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});

// Copy static files
const staticFiles = ['index.html', 'admin-login.html', 'admin-dashboard.html', '404.html'];
staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, `dist/${file}`);
        console.log(`✅ Copied: ${file}`);
    }
});

// Copy CSS
if (fs.existsSync('src/index.css')) {
    fs.copyFileSync('src/index.css', 'dist/index.css');
    console.log('✅ Copied: index.css');
}

console.log('✅ Build complete! Output in /dist');
