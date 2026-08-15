import { Cloud, Database, LogOut, Settings, ShieldCheck, X } from 'lucide-react';
import type { Seccion } from '../types';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  seccion: Seccion;
  onNavegar: (seccion: Seccion) => void;
}

const secciones: { id: Seccion; icono: typeof Database; etiqueta: string }[] = [
  { id: 'boveda', icono: Database, etiqueta: 'Bóveda' },
  { id: 'auditoria', icono: ShieldCheck, etiqueta: 'Auditoría' },
  { id: 'nube', icono: Cloud, etiqueta: 'Nube' },
  { id: 'ajustes', icono: Settings, etiqueta: 'Ajustes' },
];

export default function Sidebar({ isOpen, onClose, onLogout, seccion, onNavegar }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Logo />
          <button type="button" onClick={onClose} className="btn-ghost lg:hidden" aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Navegación principal">
          {secciones.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onNavegar(s.id);
                onClose();
              }}
              className={`flex h-11 w-full items-center gap-3 rounded-button px-4 text-sm font-medium transition-colors ${
                seccion === s.id
                  ? 'bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              aria-current={seccion === s.id ? 'page' : undefined}
            >
              <s.icono className="h-5 w-5" />
              {s.etiqueta}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex h-11 w-full items-center gap-3 rounded-button px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut className="h-5 w-5" />
            Bloquear y salir
          </button>
        </div>
      </aside>
    </>
  );
}