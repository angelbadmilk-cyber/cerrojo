import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((previos) => [...previos, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((previos) => previos.filter((t) => t.id !== id));
    }, 4000);
  };

  const cerrar = (id: string) => {
    setToasts((previos) => previos.filter((t) => t.id !== id));
  };

  const configuracion = {
    success: { Icono: CheckCircle2, clase: 'text-emerald-600 dark:text-emerald-400' },
    error: { Icono: XCircle, clase: 'text-red-600 dark:text-red-400' },
    warning: { Icono: AlertTriangle, clase: 'text-amber-600 dark:text-amber-400' },
    info: { Icono: Info, clase: 'text-blue-600 dark:text-blue-400' },
  } as const;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="fixed bottom-24 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 lg:bottom-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map(({ id, type, message }) => {
          const { Icono, clase } = configuracion[type];
          return (
            <div key={id} className="card animate-slide-up flex items-start gap-3 p-4">
              <Icono className={`h-5 w-5 shrink-0 ${clase}`} />
              <p className="flex-1 text-sm">{message}</p>
              <button
                type="button"
                onClick={() => cerrar(id)}
                className="btn-ghost shrink-0"
                aria-label="Cerrar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return contexto;
}