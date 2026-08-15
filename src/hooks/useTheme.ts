import { useEffect } from 'react';
import type { AppSettings } from '../types';
import { obtenerAjustes } from '../services/dbService';

export const ACENTOS = [
  { id: 'blue', etiqueta: 'Azul', rgb: '37 99 235', rgbDark: '29 78 216' },
  { id: 'violet', etiqueta: 'Violeta', rgb: '124 58 237', rgbDark: '109 40 217' },
  { id: 'emerald', etiqueta: 'Esmeralda', rgb: '5 150 105', rgbDark: '4 120 87' },
  { id: 'amber', etiqueta: 'Ámbar', rgb: '217 119 6', rgbDark: '180 83 9' },
  { id: 'rose', etiqueta: 'Rosa', rgb: '225 29 72', rgbDark: '190 18 60' },
];

export function aplicarTema(ajustes: AppSettings): void {
  const raiz = document.documentElement;
  const oscuro =
    ajustes.themeMode === 'dark' ||
    (ajustes.themeMode === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.classList.toggle('dark', oscuro);

  const acento = ACENTOS.find((a) => a.id === ajustes.themeColor) ?? ACENTOS[0];
  raiz.style.setProperty('--accent', acento.rgb);
  raiz.style.setProperty('--accent-dark', acento.rgbDark);
}

export function useTheme(): void {
  useEffect(() => {
    obtenerAjustes().then(aplicarTema);

    const alCambiarSistema = () => {
      obtenerAjustes().then((a) => {
        if (a.themeMode === 'system') aplicarTema(a);
      });
    };
    const alCambiarAjustes = () => obtenerAjustes().then(aplicarTema);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', alCambiarSistema);
    window.addEventListener('cerrojo:ajustes', alCambiarAjustes);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', alCambiarSistema);
      window.removeEventListener('cerrojo:ajustes', alCambiarAjustes);
    };
  }, []);
}