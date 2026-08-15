import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, LifeBuoy, Loader2 } from 'lucide-react';
import { useVault } from '../contexts/VaultContext';

interface RecoveryFormProps {
  onVolver: () => void;
}

export default function RecoveryForm({ onVolver }: RecoveryFormProps) {
  const { recuperar, preguntaRecuperacion } = useVault();
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setCargando(true);
    await recuperar(respuesta);
    setCargando(false);
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
          Recuperar bóveda
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Responde a tu pregunta secreta para poder crear una clave nueva.
        </p>
      </div>

      <div className="rounded-input border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {preguntaRecuperacion}
      </div>

      <div>
        <label htmlFor="respuesta-recuperacion" className="mb-2 block text-sm font-medium">
          Tu respuesta
        </label>
        <input
          id="respuesta-recuperacion"
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          className="input-field"
          placeholder="Escribe tu respuesta secreta"
          autoFocus
          required
        />
      </div>

      <button
        type="submit"
        disabled={!respuesta.trim() || cargando}
        className="btn-primary w-full"
      >
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="h-4 w-4" />}
        {cargando ? 'Comprobando…' : 'Recuperar bóveda'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
      </div>
    </form>
  );
}