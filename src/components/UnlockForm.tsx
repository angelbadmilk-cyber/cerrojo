import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { useVault } from '../contexts/VaultContext';

interface UnlockFormProps {
  onOlvido: () => void;
}

export default function UnlockForm({ onOlvido }: UnlockFormProps) {
  const { desbloquear, intentosRestantes } = useVault();
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [cargando, setCargando] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setCargando(true);
    await desbloquear(clave);
    setCargando(false);
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
          Desbloquear bóveda
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Introduce tu clave maestra para continuar.
        </p>
      </div>

      {intentosRestantes < 10 && (
        <div
          role="alert"
          className={`rounded-input border p-3 text-sm ${
            intentosRestantes <= 3
              ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
              : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}
        >
          Intentos restantes: {intentosRestantes}. Si llegas a 0, la bóveda local
          se eliminará por seguridad.
        </div>
      )}

      <div>
        <label htmlFor="clave-maestra" className="mb-2 block text-sm font-medium">
          Clave maestra
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="clave-maestra"
            type={verClave ? 'text' : 'password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="input-field pl-11 pr-14"
            placeholder="Tu clave maestra"
            autoFocus
            required
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setVerClave(!verClave)}
            className="btn-ghost absolute right-1 top-1/2 -translate-y-1/2"
            aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
          >
            {verClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={!clave || cargando} className="btn-primary w-full">
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {cargando ? 'Comprobando…' : 'Desbloquear'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onOlvido}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ¿Has olvidado tu clave maestra?
        </button>
      </div>
    </form>
  );
}