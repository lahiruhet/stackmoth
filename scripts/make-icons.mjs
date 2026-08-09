/* Generates favicon PNGs and the Open Graph image from the moth SVG mark. */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const BG = '#131109';
const TEXT = '#F1EAD9';
const MUTED = '#B3A891';
const AMBER = '#E6A53D';
const LINE = '#2C2617';
const LINE_STRONG = '#453B22';

const mothSvg = await readFile(new URL('../assets/moth.svg', import.meta.url), 'utf8');
const mothInner = mothSvg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

/** Moth mark scaled to `size` px, centered, on the dark rounded tile. */
function iconSvg(size) {
  const pad = size * 0.11;
  const scale = (size - pad * 2) / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="${BG}"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})">${mothInner}</g>
</svg>`;
}

function ogSvg() {
  const mothScale = 4.6;
  const mothSize = 64 * mothScale; // 294.4
  const mothX = 800 + (330 - mothSize) / 2;
  const mothY = 105;
  const cx = 800 + 330 / 2;

  // subtle grid, faded with a radial mask
  const gridLines = [];
  for (let x = 0; x <= 1200; x += 72) {
    gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="630" stroke="${AMBER}" stroke-opacity="0.05"/>`);
  }
  for (let y = 0; y <= 630; y += 72) {
    gridLines.push(`<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="${AMBER}" stroke-opacity="0.05"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="fade" cx="50%" cy="38%" r="75%">
      <stop offset="30%" stop-color="#fff"/>
      <stop offset="78%" stop-color="#000"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.16"/>
      <stop offset="70%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridmask"><rect width="1200" height="630" fill="url(#fade)"/></mask>
  </defs>

  <rect width="1200" height="630" fill="${BG}"/>
  <g mask="url(#gridmask)">${gridLines.join('')}</g>
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="${LINE}" stroke-width="1.5"/>

  <circle cx="${cx}" cy="${mothY + mothSize / 2}" r="260" fill="url(#glow)"/>
  <g transform="translate(${mothX} ${mothY}) scale(${mothScale})">${mothInner}</g>

  <!-- stack layers under the moth -->
  <g stroke="${LINE_STRONG}" stroke-width="2" fill="none">
    <rect x="${cx - 55}" y="448" width="110" height="9" rx="2"/>
    <rect x="${cx - 75}" y="466" width="150" height="9" rx="2" stroke="${AMBER}" stroke-opacity="0.4"/>
    <rect x="${cx - 95}" y="484" width="190" height="9" rx="2"/>
  </g>

  <text x="110" y="242" font-family="DejaVu Sans Mono, monospace" font-size="22" letter-spacing="6" fill="${AMBER}">INDEPENDENT SOFTWARE STUDIO</text>
  <text x="106" y="348" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="92" letter-spacing="-2" fill="${TEXT}">StackMoth</text>
  <text x="110" y="412" font-family="DejaVu Sans, sans-serif" font-size="34" fill="${MUTED}">Software, automation &amp; connected systems.</text>
</svg>`;
}

const out = (name) => new URL(`../public/${name}`, import.meta.url);

await sharp(Buffer.from(iconSvg(32))).png().toFile(out('favicon-32x32.png').pathname);
await sharp(Buffer.from(iconSvg(180))).png().toFile(out('apple-touch-icon.png').pathname);
await sharp(Buffer.from(ogSvg())).png().toFile(out('og.png').pathname);

console.log('Generated: favicon-32x32.png, apple-touch-icon.png, og.png');
