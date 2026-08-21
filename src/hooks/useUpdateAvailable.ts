import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function useUpdateAvailable() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateFn, setUpdateFn] = useState<(() => void) | null>(null);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('[Update] ✅ Nueva versión disponible');
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('[Update] App lista para uso sin conexión');
      },
      onRegistered(registration) {
        console.log('[Update] SW registrado:', registration?.scope);
        // Forzar comprobación cada hora
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onRegisteredSW(swUrl, registration) {
        console.log('[Update] SW URL:', swUrl);
      },
    });
    
    setUpdateFn(() => updateSW);
  }, []);

  const updateApp = () => {
    if (updateFn) {
      updateFn(true);
    } else {
      window.location.reload();
    }
  };

  return { needRefresh, updateApp };
}