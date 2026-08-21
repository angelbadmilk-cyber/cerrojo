import { useEffect, useState } from 'react';

export function useUpdateAvailable() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let reg: ServiceWorkerRegistration | null = null;

    const checkUpdate = async () => {
      reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      setRegistration(reg);

      // Si ya hay un service worker esperando, mostrar botón
      if (reg.waiting) {
        setNeedRefresh(true);
        return;
      }

      // Escuchar cuando aparezca una nueva versión
      reg.addEventListener('updatefound', () => {
        const newWorker = reg?.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedRefresh(true);
          }
        });
      });
    };

    void checkUpdate();

    // Comprobar actualizaciones cada hora mientras la app esté abierta
    const interval = window.setInterval(() => {
      reg?.update();
    }, 60 * 60 * 1000);

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