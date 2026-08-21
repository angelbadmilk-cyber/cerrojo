import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function useUpdateAvailable() {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[Update] ✅ Nueva versión disponible');
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log('[Update] App lista para uso sin conexión');
      },
      onRegisteredSW(_swUrl, registration) {
        console.log('[Update] SW URL:', _swUrl);
        // Comprobar actualizaciones cada hora mientras la app esté abierta
        if (registration) {
          window.setInterval(() => {
            void registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('[Update] Error al registrar SW:', error);
      },
    });
  }, []);

  const updateApp = () => {
    console.log('[Update] Recargando con nueva versión...');
    window.location.reload();
  };

  return { needRefresh, updateApp };
}