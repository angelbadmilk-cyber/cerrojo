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
        console.log('[Update] Registration:', reg);

        if (!reg) {
          console.log('[Update] No hay service worker registrado');
          return;
        }

        setRegistration(reg);

        // Si ya hay un service worker esperando, mostrar botón
        if (reg.waiting) {
          console.log('[Update] Hay un SW esperando, mostrando botón');
          setNeedRefresh(true);
          return;
        }

        // Escuchar cuando aparezca una nueva versión
        reg.addEventListener('updatefound', () => {
          console.log('[Update] Nueva versión encontrada');
          const newWorker = reg?.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            console.log('[Update] Estado del nuevo SW:', newWorker.state);
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[Update] SW instalado y hay controller, mostrando botón');
              setNeedRefresh(true);
            }
          });
        });
      } catch (error) {
        console.error('[Update] Error:', error);
      }
    };

    void checkUpdate();

    // Comprobar actualizaciones cada 30 segundos mientras la app esté abierta
    const interval = window.setInterval(() => {
      console.log('[Update] Comprobando actualizaciones...');
      reg?.update();
    }, 30 * 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const updateApp = () => {
    if (!registration?.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return { needRefresh, updateApp };
}