import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
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
];

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
  plugins: [sitemap()],
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
