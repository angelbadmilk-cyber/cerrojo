import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import type { PasswordEntry } from '../types';
import { useVault } from '../contexts/VaultContext';
import { avatarDe, normalizarTexto } from '../services/uiService';

interface CommandPaletteProps {
  consulta: string;
  onCambiarConsulta: (consulta: string) => void;
  onClose: () => void;
  onSeleccionar: (entrada: PasswordEntry) => void;
}

export default function CommandPalette({ consulta, onCambiarConsulta, onClose, onSeleccionar }: CommandPaletteProps) {
  const { entradas } = useVault();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const manejar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', manejar);
    return () => document.removeEventListener('keydown', manejar);
  }, [onClose]);

  const q = normalizarTexto(consulta);
  const resultados = q
    ? entradas
        .filter((e) => [e.siteName, e.username, e.url ?? '', e.tags.join(' ')].some((campo) => normalizarTexto(campo).includes(q)))
        .slice(0, 8)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 p-4 pt-[10vh]" onClick={onClose} role="dialog" aria-modal="true" aria-label="Buscador global">
      <div className="card animate-fade-in w-full max-w-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={consulta}
            onChange={(e) => onCambiarConsulta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && resultados[0]) onSeleccionar(resultados[0]);
            }}
            placeholder="Buscar por nombre, usuario o etiqueta…"
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!q && <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Escribe para buscar en tu bóveda.</p>}
          {q && resultados.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Sin resultados para «{consulta}».</p>
          )}
          {resultados.map((entrada) => {
            const avatar = avatarDe(entrada.siteName);
            return (
              <button
                key={entrada.id}
                type="button"
                onClick={() => onSeleccionar(entrada)}
                className="flex w-full items-center gap-3 rounded-button px-3 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-xs font-semibold text-white" style={{ backgroundColor: avatar.color }}>
                  {avatar.iniciales}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{entrada.siteName}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{entrada.username}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}