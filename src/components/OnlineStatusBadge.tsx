import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OnlineStatusBadge() {
  const enLinea = useOnlineStatus();

  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${
        enLinea
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-500/10 text-red-700 dark:text-red-400'
      }`}
    >
      {enLinea ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">
        {enLinea ? 'En línea' : 'Sin conexión'}
      </span>
    </span>
  );
}