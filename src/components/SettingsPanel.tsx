import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import type { AppSettings, EncryptedStorage, ThemeMode } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useVault } from '../contexts/VaultContext';
import { AJUSTES_POR_DEFECTO, guardarAjustes, obtenerAjustes } from '../services/dbService';
import { ACENTOS, aplicarTema } from '../hooks/useTheme';
import ConfirmationDialog from './ConfirmationDialog';

const MODOS: { id: ThemeMode; etiqueta: string }[] = [
  { id: 'light', etiqueta: 'Claro' },
  { id: 'dark', etiqueta: 'Oscuro' },
  { id: 'system', etiqueta: 'Sistema' },
];

const BLOQUEOS = [
  { valor: 1, etiqueta: '1 minuto' },
  { valor: 5, etiqueta: '5 minutos' },
  { valor: 10, etiqueta: '10 minutos' },
  { valor: 30, etiqueta: '30 minutos' },
  { valor: 0, etiqueta: 'Nunca' },
];

export default function SettingsPanel() {
  const { exportarRespaldo, importarRespaldo, purgarTodo } = useVault();
  const { showToast } = useToast();
  const [ajustes, setAjustes] = useState<AppSettings>(AJUSTES_POR_DEFECTO);
  const [dialogo, setDialogo] = useState<'purga' | 'importar' | null>(null);
  const respaldoPendiente = useRef<EncryptedStorage | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    obtenerAjustes().then(setAjustes);
  }, []);

  const guardar = async (cambios: Partial<AppSettings>) => {
    const nuevos = { ...ajustes, ...cambios };
    setAjustes(nuevos);
    await guardarAjustes(nuevos);
    aplicarTema(nuevos);
    window.dispatchEvent(new Event('cerrojo:ajustes'));
  };

  const exportar = () => {
    const storage = exportarRespaldo();
    if (!storage) {
      showToast('warning', 'No hay ninguna bóveda que exportar.');
      return;
    }
    const blob = new Blob([JSON.stringify(storage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `cerrojo-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Respaldo cifrado exportado.');
  };

  const leerRespaldo = (archivo: File) => {
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const datos = JSON.parse(String(lector.result)) as EncryptedStorage;
        if (!datos.salt || !datos.verifier || !datos.encryptedVault || !datos.wrappedKey) {
          throw new Error('incompleto');
        }
        respaldoPendiente.current = datos;
        setDialogo('importar');
      } catch {
        showToast('error', 'El archivo no es un respaldo válido de Cerrojo.');
      }
    };
    lector.readAsText(archivo);
  };

  const alElegirArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) leerRespaldo(archivo);
    evento.target.value = '';
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ajustes</h1>

      <section className="card space-y-5 p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Apariencia</h2>

        <div>
          <p className="mb-2 text-sm font-medium">Tema</p>
          <div className="flex overflow-hidden rounded-button border border-slate-300 dark:border-slate-700">
            {MODOS.map((modo) => (
              <button
                key={modo.id}
                type="button"
                onClick={() => void guardar({ themeMode: modo.id })}
                aria-pressed={ajustes.themeMode === modo.id}
                className={`h-11 flex-1 text-sm font-medium transition-colors ${
                  ajustes.themeMode === modo.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {modo.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Color de acento</p>
          <div className="flex flex-wrap gap-2">
            {ACENTOS.map((acento) => (
              <button
                key={acento.id}
                type="button"
                onClick={() => void guardar({ themeColor: acento.id })}
                aria-label={`Color ${acento.etiqueta}`}
                aria-pressed={ajustes.themeColor === acento.id}
                className={`h-11 w-11 rounded-full transition-transform ${
                  ajustes.themeColor === acento.id ? 'scale-110 ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900' : ''
                }`}
                style={{ backgroundColor: `rgb(${acento.rgb})` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="card space-y-5 p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Seguridad</h2>

        <div>
          <label htmlFor="autobloqueo" className="mb-2 block text-sm font-medium">
            Bloqueo automático por inactividad
          </label>
          <select
            id="autobloqueo"
            className="input-field"
            value={ajustes.autoLockTimeout}
            onChange={(e) => void guardar({ autoLockTimeout: Number(e.target.value) })}
          >
            {BLOQUEOS.map((b) => (
              <option key={b.valor} value={b.valor}>
                {b.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={ajustes.faviconsEnabled}
          onClick={() => void guardar({ faviconsEnabled: !ajustes.faviconsEnabled })}
          className="flex w-full items-center justify-between gap-4 py-1 text-left"
        >
          <span>
            <span className="block text-sm font-medium">Mostrar favicons de sitios web</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Desactivado por privacidad: cargarlos revela qué sitios usas. Actívalo bajo tu responsabilidad.
            </span>
          </span>
          <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${ajustes.faviconsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${ajustes.faviconsEnabled ? 'left-6' : 'left-1'}`} />
          </span>
        </button>

        <div className="flex w-full items-center justify-between gap-4 py-1 opacity-60">
          <span>
            <span className="block text-sm font-medium">Desbloqueo biométrico</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Disponible en la app de escritorio (llegará con el instalador).
            </span>
          </span>
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-700" aria-hidden="true">
            <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow" />
          </span>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Datos</h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={exportar} className="btn-secondary flex-1">
            <Download className="h-4 w-4" />
            Exportar respaldo cifrado
          </button>
          <button type="button" onClick={() => inputArchivo.current?.click()} className="btn-secondary flex-1">
            <Upload className="h-4 w-4" />
            Importar respaldo
          </button>
          <input ref={inputArchivo} type="file" accept="application/json,.json" className="hidden" onChange={alElegirArchivo} aria-label="Seleccionar archivo de respaldo" />
        </div>

        <button
          type="button"
          onClick={() => setDialogo('purga')}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-button bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar todos los datos
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Borra físicamente la bóveda local, los intentos y los ajustes de este dispositivo.
        </p>
      </section>

      {dialogo === 'purga' && (
        <ConfirmationDialog
          titulo="Eliminar todos los datos"
          mensaje="Se borrará la bóveda, los ajustes y todo el contenido local de forma permanente. Esta acción no se puede deshacer."
          textoBoton="Eliminar todo"
          onConfirmar={() => {
            void purgarTodo().then(() => aplicarTema(AJUSTES_POR_DEFECTO));
          }}
          onClose={() => setDialogo(null)}
        />
      )}

      {dialogo === 'importar' && (
        <ConfirmationDialog
          titulo="Importar respaldo"
          mensaje="Se reemplazará la bóveda actual por la del respaldo. Después necesitarás la clave maestra de ese respaldo."
          textoBoton="Importar"
          onConfirmar={() => {
            if (respaldoPendiente.current) void importarRespaldo(respaldoPendiente.current);
          }}
          onClose={() => setDialogo(null)}
        />
      )}
    </div>
  );
}