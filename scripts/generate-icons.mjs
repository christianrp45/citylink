import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// SVG do ícone CityLink — fundo azul, letra C estilizada com ponto de localização
function makeSvg(size) {
  const r = Math.round(size * 0.18); // raio do canto arredondado
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(size * 0.42);
  const pinSize = Math.round(size * 0.22);
  const pinTop = Math.round(size * 0.08);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
  </defs>

  <!-- Fundo arredondado -->
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>

  <!-- Letra C -->
  <text
    x="${cx - size * 0.04}"
    y="${cy + fontSize * 0.35}"
    font-family="Arial, Helvetica, sans-serif"
    font-size="${fontSize}"
    font-weight="900"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
  >C</text>

  <!-- Pin de localização (ponto azul claro) no canto superior direito do C -->
  <circle
    cx="${cx + size * 0.14}"
    cy="${pinTop + pinSize * 0.5}"
    r="${pinSize * 0.36}"
    fill="#93c5fd"
  />
  <polygon
    points="${cx + size * 0.14},${pinTop + pinSize * 0.85} ${cx + size * 0.08},${pinTop + pinSize * 0.5} ${cx + size * 0.2},${pinTop + pinSize * 0.5}"
    fill="#93c5fd"
  />
</svg>`;
}

async function generate(size, filename) {
  const svg = Buffer.from(makeSvg(size));
  const outPath = join(__dirname, '..', 'public', 'images', filename);
  await sharp(svg).png().toFile(outPath);
  console.log(`✅ Gerado: ${filename} (${size}×${size})`);
}

await generate(192, 'icon-192.png');
await generate(512, 'icon-512.png');
console.log('🎉 Ícones PWA gerados com sucesso!');
