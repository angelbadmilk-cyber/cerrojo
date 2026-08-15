import { KeyRound, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <KeyRound className="h-8 w-8" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Tu bóveda está vacía</h2>
      <p className="mb-6 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        Añade tu primera contraseña para empezar a proteger tus cuentas.
      </p>
      <button type="button" onClick={onAdd} className="btn-primary">
        <Plus className="h-4 w-4" />
        Añadir mi primera contraseña
      </button>
    </div>
  );
}