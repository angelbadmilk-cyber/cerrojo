import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Cloud, Download, LogOut, Upload } from 'lucide-react';
import type { EncryptedStorage } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useVault } from '../contexts/VaultContext';
import {
  descargarBoveda,
  emailSesion,
  entrarNube,
  registrarNube,
  salirNube,
  subirBoveda,
  ultimaSincronizacion,
} from '../services/cloudSync';
import { nubeConfigurada } from '../services/supabaseClient';
import { fechaRelativa } from '../services/uiService';
import CloudSetup from './CloudSetup';
import ConfirmationDialog from './ConfirmationDialog';

function PanelNube() {
  const { exportarRespaldo, importarRespaldo } = useVault();
  const { showToast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [correo, setCorreo] = useState('');
  const [claveNube, setClaveNube] = useState('');
  const [modoRegistro, setModoRegistro] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [pendienteImportar, setPendienteImportar] = useState<EncryptedStorage | null>(null);
  const [ultimoSync, setUltimoSync] = useState<string | null>(ultimaSincronizacion());

  useEffect(() => {
    emailSesion().then(setEmail);
  }, []);

  const autenticar = async (evento: FormEvent) => {
    evento.preventDefault();
    setCargando(true);
    const error = modoRegistro
      ? await registrarNube(correo.trim(), claveNube)
      : await entrarNube(correo.trim(), claveNube);
    setCargando(false);
    if (error) {
      showToast('error', error);
      return;
    }
    setEmail(correo.trim());
    showToast('success', modoRegistro ? 'Cuenta creada en la nube.' : 'Sesión iniciada en la nube.');

    const local = exportarRespaldo();
    const remota = await descargarBoveda();
    if (!remota && local) {
      const err = await subirBoveda(local);
      if (!err) {
        setUltimoSync(ultimaSincronizacion());
        showToast('success', 'Primera copia de tu bóveda subida a la nube.');
      }
    }
  };

  const subir = async () => {
    const local = exportarRespaldo();
    if (!local) return;
    setCargando(true);
    const error = await subirBoveda(local);
    setCargando(false);
    if (error) showToast('error', error);
    else {
      setUltimoSync(ultimaSincronizacion());
      showToast('success', 'Bóveda subida a la nube.');
    }
  };

  const descargar = async () => {
    setCargando(true);
    const remota = await descargarBoveda();
    setCargando(false);
    if (!remota) {
      showToast('info', 'Todavía no hay ninguna bóveda en la nube.');
      return;
    }
    setPendienteImportar(remota);
  };

  const salir = async () => {
    await salirNube();
    setEmail(null);
    showToast('info', 'Sesión de nube cerrada. Tu bóveda local no se ha tocado.');
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sincronización en la nube</h1>

      {!email ? (
        <div className="card p-6">
          <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            {modoRegistro ? 'Crear cuenta en la nube' : 'Iniciar sesión en la nube'}
          </h2>
          <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
            Usa un correo tuyo y una contraseña para la nube. Tu bóveda seguirá cifrada con tu clave maestra.
          </p>
          <form onSubmit={autenticar} className="space-y-4">
            <div>
              <label htmlFor="correo" className="mb-2 block text-sm font-medium">Correo electrónico</label>
              <input id="correo" type="email" className="input-field" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" required />
            </div>
            <div>
              <label htmlFor="clave-nube" className="mb-2 block text-sm font-medium">Contraseña de la nube</label>
              <input id="clave-nube" type="password" className="input-field" value={claveNube} onChange={(e) => setClaveNube(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full">
              <Cloud className="h-4 w-4" />
              {cargando ? 'Conectando…' : modoRegistro ? 'Crear cuenta y subir bóveda' : 'Entrar y sincronizar'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setModoRegistro(!modoRegistro)}
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              {modoRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Créala aquí'}
            </button>
          </p>
        </div>
      ) : (
        <div className="card space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Conectado</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{email}</p>
            </div>
            <button type="button" onClick={() => void salir()} className="btn-secondary">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            {ultimoSync
              ? `Última sincronización: ${fechaRelativa(ultimoSync)}.`
              : 'Aún no has sincronizado en este dispositivo.'}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => void subir()} disabled={cargando} className="btn-primary flex-1">
              <Upload className="h-4 w-4" />
              Subir bóveda ahora
            </button>
            <button type="button" onClick={() => void descargar()} disabled={cargando} className="btn-secondary flex-1">
              <Download className="h-4 w-4" />
              Descargar bóveda
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cada cambio en tu bóveda se sube automáticamente si hay sesión abierta. Al descargar,
            se reemplaza la bóveda local y se te pedirá su clave maestra.
          </p>
        </div>
      )}

      {pendienteImportar && (
        <ConfirmationDialog
          titulo="Descargar bóveda de la nube"
          mensaje="Se reemplazará la bóveda de este dispositivo por la copia de la nube. Después introducirás la clave maestra de esa copia."
          textoBoton="Descargar"
          onConfirmar={() => void importarRespaldo(pendienteImportar)}
          onClose={() => setPendienteImportar(null)}
        />
      )}
    </div>
  );
}

export default function CloudPanel() {
  if (!nubeConfigurada) return <CloudSetup />;
  return <PanelNube />;
}