import { LayoutGrid, List, Plus } from 'lucide-react';
import type { ViewMode } from '../types';

interface VaultHeaderProps {
  total: number;
  vista: ViewMode;
  onCambiarVista: (vista: ViewMode) => void;
  onAdd: () => void;
}

export default function VaultHeader({ total, vista, onCambiarVista, onAdd }: VaultHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mi bóveda</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {total} {total === 1 ? 'elemento' : 'elementos'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex overflow-hidden rounded-button border border-slate-300 dark:border-slate-700" role="group" aria-label="Cambiar vista">
          <button
            type="button"
            onClick={() => onCambiarVista('list')}
            className={`flex h-11 w-11 items-center justify-center transition-colors ${
              vista === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Vista de lista"
            aria-pressed={vista === 'list'}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onCambiarVista('grid')}
            className={`flex h-11 w-11 items-center justify-center transition-colors ${
              vista === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Vista de tarjetas"
            aria-pressed={vista === 'grid'}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
        </div>
        <button type="button" onClick={onAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Añadir</span>
        </button>
      </div>
    </div>
  );
}