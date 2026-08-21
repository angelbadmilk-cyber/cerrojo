import { Download } from 'lucide-react';
import { useUpdateAvailable } from '../hooks/useUpdateAvailable';

export default function UpdateNotification() {
  const { needRefresh, updateApp } = useUpdateAvailable();

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