import { useEffect, useState } from 'react';

export function useUpdateAvailable() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[Update] Service Worker no soportado');
      return;
    }

    let reg: ServiceWorkerRegistration | null = null;

    const checkUpdate = async () => {
      try {
        const obtenido = await navigator.serviceWorker.getRegistration();
        reg = obtenido ?? null;
        console.log('[Update] Registration obtenida:', reg?.scope);

        if (!reg) {
          console.log('[Update] No hay service worker registrado');
          return;
        }

        setRegistration(reg);
        console.log('[Update] Estado inicial:', {
          installing: reg.installing ? 'sí' : 'no',
          waiting: reg.waiting ? 'sí' : 'no',
          active: reg.active ? 'sí' : 'no',
        });

        // Si ya hay un SW esperando, mostrar botón inmediatamente
        if (reg.waiting) {
          console.log('[Update] ✅ Hay SW esperando, mostrando botón');
          setNeedRefresh(true);
        }

        // FORZAR actualización inmediata
        console.log('[Update] Forzando update...');
        await reg.update();
        console.log('[Update] Update completado, nuevo estado:', {
          installing: reg.installing ? 'sí' : 'no',
          waiting: reg.waiting ? 'sí' : 'no',
          active: reg.active ? 'sí' : 'no',
        });

        // Si después del update hay SW esperando, mostrar botón
        if (reg.waiting && !needRefresh) {
          console.log('[Update] ✅ SW esperando después del update');
          setNeedRefresh(true);
        }

        // Escuchar nuevas versiones
        reg.addEventListener('updatefound', () => {
          console.log('[Update] 🆕 Nueva versión encontrada');
          const newWorker = reg?.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            console.log('[Update] Estado nuevo SW:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Update] ✅ SW instalado, mostrando botón');
              setNeedRefresh(true);
            }
          });
        });
      } catch (error) {
        console.error('[Update] Error:', error);
      }
    };

    void checkUpdate();

    // Detectar cambio de controller (cuando el SW nuevo toma el control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[Update] 🔄 Controller change detectado');
    });

    // Comprobar cada 30 segundos
    const interval = window.setInterval(() => {
      console.log('[Update] Comprobación periódica...');
      reg?.update().then(() => {
        if (reg?.waiting && !needRefresh) {
          console.log('[Update] ✅ SW esperando en check periódico');
          setNeedRefresh(true);
        }
      });
    }, 30 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const updateApp = () => {
    if (!registration?.waiting) {
      console.log('[Update] No hay SW waiting, recargando directamente');
      window.location.reload();
      return;
    }
    console.log('[Update] Enviando SKIP_WAITING');
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return { needRefresh, updateApp };
}