import { defineConfig } from 'vite';
import { cpSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE = 'https://stackmoth.com';

// Every directory under work/ is a case study page. Enumerating them here keeps
// the build in sync with what actually exists, so adding a case study is one
// new folder and nothing else.
const workSlugs = readdirSync(resolve(__dirname, 'work'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const workPages = Object.fromEntries(
  workSlugs.map((slug) => [`work-${slug}`, resolve(__dirname, 'work', slug, 'index.html')]),
);

// Routes that should appear in search results, paired with the file whose
// modification time is the honest lastmod for each one.
const routes = [
  ['/', resolve(__dirname, 'index.html')],
  ['/work/', resolve(__dirname, 'work/index.html')],
  ...workSlugs.map((slug) => [`/work/${slug}/`, resolve(__dirname, 'work', slug, 'index.html')]),
  ['/rainfall/', resolve(__dirname, 'rainfall/index.html')],
];

// The rainfall tracker keeps its original project layout under rainfall/ so its
// own tests and nightly generator run unchanged. Only the files a browser needs
// are published; scripts/, test/ and package.json stay out of dist.
const RAINFALL_PUBLISHED = ['index.html', 'app.js', 'lib', 'vendor', 'data'];

function rainfall() {
  return {
    name: 'stackmoth-rainfall',
    writeBundle(options) {
      const out = resolve(options.dir, 'rainfall');
      for (const entry of RAINFALL_PUBLISHED) {
        cpSync(resolve(__dirname, 'rainfall', entry), resolve(out, entry), { recursive: true });
      }
    },
  };
}

// Built from the same list as the inputs above, so the sitemap cannot drift out
// of step with the pages that actually ship.
function sitemap() {
  return {
    name: 'stackmoth-sitemap',
    generateBundle() {
      const body = routes
        .map(([route, file]) => {
          const lastmod = statSync(file).mtime.toISOString().slice(0, 10);
          return `  <url>\n    <loc>${SITE}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
        })
        .join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [sitemap(), rainfall()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, '404.html'),
        work: resolve(__dirname, 'work/index.html'),
        ...workPages,
      },
    },
  },
});
