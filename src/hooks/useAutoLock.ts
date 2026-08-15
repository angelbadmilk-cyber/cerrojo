import { useEffect, useRef } from 'react';
import { obtenerAjustes } from '../services/dbService';

// Bloquea la bóveda tras X minutos sin actividad (0 = nunca)
export function useAutoLock(alBloquear: () => void) {
  const ref = useRef(alBloquear);
  ref.current = alBloquear;

  useEffect(() => {
    let minutos = 5;
    let temporizador: number | undefined;

    const reiniciar = () => {
      window.clearTimeout(temporizador);
      if (minutos > 0) {
        temporizador = window.setTimeout(() => ref.current(), minutos * 60000);
      }
    };

    const cargar = () => {
      obtenerAjustes().then((ajustes) => {
        minutos = ajustes.autoLockTimeout;
        reiniciar();
      });
    };
    cargar();

    const alActividad = () => reiniciar();
    const eventos = ['mousemove', 'keydown', 'click', 'touchstart', 'wheel'];
    eventos.forEach((e) => window.addEventListener(e, alActividad, { passive: true }));
    window.addEventListener('cerrojo:ajustes', cargar);

    return () => {
      window.clearTimeout(temporizador);
      eventos.forEach((e) => window.removeEventListener(e, alActividad));
      window.removeEventListener('cerrojo:ajustes', cargar);
    };
  }, []);
}