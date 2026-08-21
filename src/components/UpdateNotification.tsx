import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function UpdateNotification() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setNeedRefresh(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const updateApp = async () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <button
        onClick={updateApp}
        className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700"
      >
        <Download className="h-4 w-4" />
        Nueva versión disponible - Actualizar
      </button>
    </div>
  );
}