import { Cloud, Database, Settings, ShieldCheck } from 'lucide-react';
import type { Seccion } from '../types';

interface BottomNavProps {
  seccion: Seccion;
  onNavegar: (seccion: Seccion) => void;
}

const elementos: { id: Seccion; icono: typeof Database; etiqueta: string }[] = [
  { id: 'boveda', icono: Database, etiqueta: 'Bóveda' },
  { id: 'auditoria', icono: ShieldCheck, etiqueta: 'Auditoría' },
  { id: 'nube', icono: Cloud, etiqueta: 'Nube' },
  { id: 'ajustes', icono: Settings, etiqueta: 'Ajustes' },
];

export default function BottomNav({ seccion, onNavegar }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 lg:hidden"
      aria-label="Navegación inferior"
    >
      <div className="flex h-16">
        {elementos.map((elemento) => (
          <button
            key={elemento.id}
            type="button"
            onClick={() => onNavegar(elemento.id)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium ${
              seccion === elemento.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            aria-current={seccion === elemento.id ? 'page' : undefined}
          >
            <elemento.icono className="h-5 w-5" />
            {elemento.etiqueta}
          </button>
        ))}
      </div>
    </nav>
  );
}