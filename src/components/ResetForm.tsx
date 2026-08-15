import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { useVault } from '../contexts/VaultContext';

export default function ResetForm() {
  const { restablecer } = useVault();
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError('');
    if (clave.length < 8) {
      setError('La clave maestra debe tener al menos 8 caracteres.');
      return;
    }
    if (clave !== confirmacion) {
      setError('Las claves no coinciden.');
      return;
    }
    setCargando(true);
    await restablecer(clave);
    setCargando(false);
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
          Nueva clave maestra
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Identidad verificada. Elige una clave nueva: tu bóveda se mantendrá intacta.
        </p>
      </div>

      <div>
        <label htmlFor="clave-nueva" className="mb-2 block text-sm font-medium">
          Nueva clave maestra
        </label>
        <div className="relative">
          <input
            id="clave-nueva"
            type={verClave ? 'text' : 'password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="input-field pr-14"
            placeholder="Nueva clave maestra"
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setVerClave(!verClave)}
            className="btn-ghost absolute right-1 top-1/2 -translate-y-1/2"
            aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
          >
            {verClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <PasswordStrengthMeter password={clave} />
      </div>

      <div>
        <label htmlFor="clave-confirmar" className="mb-2 block text-sm font-medium">
          Repite la nueva clave
        </label>
        <input
          id="clave-confirmar"
          type={verClave ? 'text' : 'password'}
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="input-field"
          placeholder="Repite la nueva clave"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={cargando} className="btn-primary w-full">
        {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {cargando ? 'Guardando…' : 'Guardar nueva clave'}
      </button>
    </form>
  );
}