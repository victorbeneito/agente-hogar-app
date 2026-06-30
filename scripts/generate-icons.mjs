// Genera los iconos PWA (192x192, 512x512, maskable) a partir de un SVG con
// los colores de marca. Uso: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdirSync } from "fs";

const PRIMARY = "#6BAEC9";

mkdirSync("public/icons", { recursive: true });

function houseSvg({ size, padding = 0 }) {
  const inner = size - padding * 2;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="${padding > 0 ? 0 : 96}" fill="${PRIMARY}"/>
  <g transform="translate(${(512 - inner * (512 / size)) / 2}, 0)">
    <path d="M256 96L120 208v208h80V288h112v128h80V208L256 96z" fill="#ffffff"/>
  </g>
</svg>`;
}

const targets = [
  { file: "public/icons/icon-192.png", size: 192 },
  { file: "public/icons/icon-512.png", size: 512 },
  { file: "public/icons/icon-maskable-512.png", size: 512, padding: 64 },
  { file: "public/icons/apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  const svg = houseSvg(t);
  await sharp(Buffer.from(svg)).png().toFile(t.file);
  console.log(`✓ ${t.file}`);
}
