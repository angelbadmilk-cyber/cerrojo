import { useEffect } from 'react';

// Atajo Ctrl/Cmd + K para abrir el buscador global
export function useHotkeys(alAbrirBuscador: () => void) {
  useEffect(() => {
    const manejarTecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        alAbrirBuscador();
      }
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [alAbrirBuscador]);
}