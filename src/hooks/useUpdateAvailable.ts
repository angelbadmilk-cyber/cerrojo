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
        console.log('[Update] SW registrado:', _swUrl);
        if (!registration) return;

        // Comprobar actualización INMEDIATAMENTE al abrir la app
        void registration.update();

        // Comprobar cada 5 minutos mientras la app esté abierta
        window.setInterval(() => {
          void registration.update();
        }, 5 * 60 * 1000);

        // Comprobar cuando la app vuelve a primer plano (crucial para PWA)
        const onVisible = () => {
          if (document.visibilityState === 'visible') {
            console.log('[Update] App visible, comprobando actualizaciones');
            void registration.update();
          }
        };
        document.addEventListener('visibilitychange', onVisible);

        // Limpiar el listener al desmontar
        return () => {
          document.removeEventListener('visibilitychange', onVisible);
        };
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