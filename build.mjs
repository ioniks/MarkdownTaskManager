// Build: concatenate src/ partials into a single self-contained task-manager.html.
// No runtime dependencies are produced — the output is one standalone HTML file.
//   npm run build       -> minified task-manager.html
//   npm run build:dev   -> readable (unminified) task-manager.html
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { minify } from 'html-minifier-terser';

const dev = process.argv.includes('--dev');

// Concatenate every file of a given extension in a directory, sorted by name
// (file names are numbered, e.g. 00-...,01-..., to control order).
function concatDir(dir, ext) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => `/* ===== ${f} ===== */\n${readFileSync(join(dir, f), 'utf8').trim()}`)
    .join('\n\n');
}

const css = concatDir('src/styles', '.css');
const js = concatDir('src/scripts', '.js');

// Function replacers so $ / ${...} inside css/js are inserted literally.
let html = readFileSync('src/index.html', 'utf8')
  .replace('/* build:css */', () => css)
  .replace('/* build:js */', () => js);

if (!dev) {
  html = await minify(html, {
    collapseWhitespace: true,
    conservativeCollapse: false,
    removeComments: true,
    minifyCSS: true,
    // Classic script (not a module): keep top-level names so inline on* handlers
    // and cross-file global calls keep working.
    minifyJS: {
      compress: true,
      mangle: { toplevel: false },
      format: { comments: false },
    },
  });
}

writeFileSync('task-manager.html', html);
console.log(`Built task-manager.html (${dev ? 'dev/readable' : 'minified'}) — ${(html.length / 1024).toFixed(1)} KB`);
