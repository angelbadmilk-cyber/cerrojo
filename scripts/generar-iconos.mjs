import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const raiz = process.cwd();
const pub = path.join(raiz, 'public');
mkdirSync(pub, { recursive: true });

const normal = readFileSync(path.join(raiz, 'scripts', 'icono.svg'));
const maskable = readFileSync(path.join(raiz, 'scripts', 'icono-maskable.svg'));

const tareas = [
  [normal, 192, 'icon-192.png'],
  [normal, 512, 'icon-512.png'],
  [normal, 180, 'apple-touch-icon.png'],
  [normal, 32, 'favicon-32.png'],
  [maskable, 512, 'icon-maskable-512.png'],
];

for (const [svg, tam, nombre] of tareas) {
  await sharp(svg).resize(tam, tam).png().toFile(path.join(pub, nombre));
}

console.log('✅ Iconos generados en public/');