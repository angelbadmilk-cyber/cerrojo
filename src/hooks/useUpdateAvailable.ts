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
      onRegisteredSW(_swUrl, registration) {
        console.log('[Update] SW URL:', _swUrl);
        // Forzar comprobación cada hora
        if (registration) {
          window.setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
    });

    setUpdateFn(() => updateSW);
  }, []);

  const updateApp = () => {
    if (updateFn) {
      updateFn();
    } else {
      window.location.reload();
    }
  };

  return { needRefresh, updateApp };
}