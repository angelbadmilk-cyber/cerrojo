import { X } from 'lucide-react';
import type { Category } from '../types';
import { CATEGORIAS } from '../services/uiService';

interface VaultFiltersProps {
  categoria: Category | 'todas';
  onCategoria: (categoria: Category | 'todas') => void;
  etiquetas: string[];
  etiqueta: string;
  onEtiqueta: (etiqueta: string) => void;
}

export default function VaultFilters({ categoria, onCategoria, etiquetas, etiqueta, onEtiqueta }: VaultFiltersProps) {
  const hayFiltro = categoria !== 'todas' || etiqueta !== '';

  const chip = (activa: boolean) =>
    `h-11 rounded-full px-4 text-sm font-medium transition-colors ${
      activa
        ? 'bg-blue-600 text-white'
        : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <button type="button" className={chip(categoria === 'todas')} onClick={() => onCategoria('todas')}>
        Todas
      </button>
      {CATEGORIAS.map((c) => (
        <button key={c.id} type="button" className={chip(categoria === c.id)} onClick={() => onCategoria(c.id)}>
          {c.etiqueta}
        </button>
      ))}

      {etiquetas.length > 0 && (
        <select
          value={etiqueta}
          onChange={(e) => onEtiqueta(e.target.value)}
          className="h-11 rounded-input border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
          aria-label="Filtrar por etiqueta"
        >
          <option value="">Etiquetas…</option>
          {etiquetas.map((t) => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>
      )}

      {hayFiltro && (
        <button
          type="button"
          onClick={() => {
            onCategoria('todas');
            onEtiqueta('');
          }}
          className="inline-flex h-11 items-center gap-1 px-3 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      )}
    </div>
  );
}