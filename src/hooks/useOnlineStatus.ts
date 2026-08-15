import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [enLinea, setEnLinea] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const conectar = () => setEnLinea(true);
    const desconectar = () => setEnLinea(false);

    window.addEventListener('online', conectar);
    window.addEventListener('offline', desconectar);

    return () => {
      window.removeEventListener('online', conectar);
      window.removeEventListener('offline', desconectar);
    };
  }, []);

  return enLinea;
}