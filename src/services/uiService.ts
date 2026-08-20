import type { Category } from '../types';

export const CATEGORIAS: { id: Category; etiqueta: string }[] = [
  { id: 'social', etiqueta: 'Social' },
  { id: 'work', etiqueta: 'Trabajo' },
  { id: 'finance', etiqueta: 'Finanzas' },
  { id: 'personal', etiqueta: 'Personal' },
  { id: 'streaming', etiqueta: 'Streaming' },
  { id: 'other', etiqueta: 'Otras' },
];

export function etiquetaCategoria(id: Category): string {
  return CATEGORIAS.find((c) => c.id === id)?.etiqueta ?? 'Otras';
}

export function colorCategoria(id: Category): string {
  const colores: Record<Category, string> = {
    social: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    work: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    finance: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    personal: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    streaming: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    other: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  };
  return colores[id];
}

export function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function fechaRelativa(iso: string): string {
  const fecha = new Date(iso);
  const diffMin = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (diffMin < 1) return 'ahora mismo';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ayer';
  if (diffD < 30) return `hace ${diffD} días`;
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Avatar determinista local: sin peticiones externas (privacidad)
export function avatarDe(nombre: string): { iniciales: string; color: string } {
  let hash = 0;
  for (let i = 0; i < nombre.length; i += 1) {
    hash = (hash * 31 + nombre.charCodeAt(i)) >>> 0;
  }
  const tono = hash % 360;
  const palabras = nombre.trim().split(/\s+/);
  const primera = palabras[0]?.charAt(0) ?? '?';
  const segunda = palabras[1]?.charAt(0) ?? '';
  return {
    iniciales: (primera + segunda).toUpperCase() || '?',
    color: `hsl(${tono} 60% 45%)`,
  };
}

let temporizadorPortapapeles: number | undefined;

// Copia y limpia el portapapeles a los 30 s
export async function copiarAlPortapapeles(texto: string): Promise<void> {
  await navigator.clipboard.writeText(texto);
  window.clearTimeout(temporizadorPortapapeles);
  temporizadorPortapapeles = window.setTimeout(async () => {
    try {
      const actual = await navigator.clipboard.readText();
      if (actual === texto) await navigator.clipboard.writeText('');
    } catch {
      // Sin permiso de lectura, no borramos lo que el usuario haya copiado después.
    }
  }, 30000);
}