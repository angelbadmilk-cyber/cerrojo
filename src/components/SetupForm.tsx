import { useState } from 'react';
import type { FormEvent } from 'react';
import { Cloud, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { useVault } from '../contexts/VaultContext';

const SUGERENCIAS = [
  '¿Cómo se llamaba tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál era el apellido de tu primera profesora o profesor?',
  '¿Qué modelo fue tu primera bici o moto?',
  '¿Cómo se llamaba tu mejor amigo o amiga de la infancia?',
];

export default function SetupForm() {
  const { configurar, restaurarDesdeNube } = useVault();
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estado para el modo de restauración
  const [modoRestaurar, setModoRestaurar] = useState(false);
  const [emailNube, setEmailNube] = useState('');
  const [passwordNube, setPasswordNube] = useState('');

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
    if (!pregunta.trim()) {
      setError('Escribe una pregunta de recuperación.');
      return;
    }
    if (!respuesta.trim()) {
      setError('Escribe la respuesta de recuperación.');
      return;
    }
    setCargando(true);
    await configurar(clave, pregunta.trim(), respuesta);
    setCargando(false);
  };

  const restaurar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError('');
    if (!emailNube.trim() || !passwordNube) {
      setError('Introduce tu email y contraseña de la nube.');
      return;
    }
    setCargando(true);
    const error = await restaurarDesdeNube(emailNube.trim(), passwordNube);
    setCargando(false);
    if (error) {
      setError(error);
    }
  };

  if (modoRestaurar) {
    return (
      <form onSubmit={restaurar} className="space-y-5">
        <div>
          <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
            Restaurar desde la nube
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Introduce las credenciales de tu cuenta en la nube para descargar tu bóveda.
          </p>
        </div>

        <div>
          <label htmlFor="email-nube" className="mb-2 block text-sm font-medium">
            Email de la nube
          </label>
          <input
            id="email-nube"
            type="email"
            value={emailNube}
            onChange={(e) => setEmailNube(e.target.value)}
            className="input-field"
            placeholder="tu@email.com"
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="password-nube" className="mb-2 block text-sm font-medium">
            Contraseña de la nube
          </label>
          <input
            id="password-nube"
            type="password"
            value={passwordNube}
            onChange={(e) => setPasswordNube(e.target.value)}
            className="input-field"
            placeholder="Tu contraseña de la nube"
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button type="submit" disabled={cargando} className="btn-primary w-full">
          {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
          {cargando ? 'Descargando…' : 'Descargar bóveda'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setModoRestaurar(false);
              setError('');
            }}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Volver a crear bóveda nueva
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div>
        <h1 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
          Crea tu bóveda
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Esta clave cifrará todo. No la compartas: ni nosotros podemos recuperarla.
        </p>
      </div>

      <div>
        <label htmlFor="clave-nueva" className="mb-2 block text-sm font-medium">
          Clave maestra (mínimo 8 caracteres)
        </label>
        <div className="relative">
          <input
            id="clave-nueva"
            type={verClave ? 'text' : 'password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="input-field pr-14"
            placeholder="Tu clave maestra"
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
          Repite la clave maestra
        </label>
        <input
          id="clave-confirmar"
          type={verClave ? 'text' : 'password'}
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="input-field"
          placeholder="Repite la clave"
          required
        />
      </div>

      <div>
        <label htmlFor="pregunta" className="mb-2 block text-sm font-medium">
          Pregunta secreta de recuperación
        </label>
        <input
          id="pregunta"
          type="text"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          className="input-field"
          placeholder="Escribe tu propia pregunta o elige una sugerencia"
          list="preguntas-sugeridas"
          required
        />
        <datalist id="preguntas-sugeridas">
          {SUGERENCIAS.map((sugerencia) => (
            <option key={sugerencia} value={sugerencia} />
          ))}
        </datalist>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Puedes escribir tu propia pregunta: solo tú debes conocer la respuesta.
        </p>
      </div>

      <div>
        <label htmlFor="respuesta" className="mb-2 block text-sm font-medium">
          Respuesta secreta
        </label>
        <input
          id="respuesta"
          type="text"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          className="input-field"
          placeholder="Solo tú debes saberla"
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={cargando} className="btn-primary w-full">
        {cargando ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {cargando ? 'Creando bóveda…' : 'Crear bóveda'}
      </button>

      <div className="relative my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-500 dark:text-slate-400">o</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <button
        type="button"
        onClick={() => setModoRestaurar(true)}
        className="btn-secondary w-full"
      >
        <Cloud className="h-4 w-4" />
        Restaurar desde la nube
      </button>
    </form>
  );
}