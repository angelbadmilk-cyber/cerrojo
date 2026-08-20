import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { EncryptedStorage, PasswordEntry } from '../types';
import {
  cifrarEntradasEnStorage,
  crearBoveda,
  descifrarEntradas,
  desbloquearBoveda,
  recuperarConRespuesta,
  restablecerClaveMaestra,
} from '../services/cryptoService';
import {
  descargarBovedaConFecha,
  entrarNube,
  subirBoveda,
  subirSiHaySesion,
} from '../services/cloudSync';
import {
  cargarBoveda,
  fijarIntentosFallidos,
  guardarBoveda,
  obtenerIntentosFallidos,
  purgaTotal,
} from '../services/dbService';
import { useToast } from './ToastContext';

export const MAX_INTENTOS = 10;

export type EstadoApp =
  | 'cargando'
  | 'configuracion'
  | 'bloqueado'
  | 'restablecer'
  | 'desbloqueado';

interface VaultContextValue {
  estado: EstadoApp;
  entradas: PasswordEntry[];
  intentosRestantes: number;
  preguntaRecuperacion: string;
  configurar: (clave: string, pregunta: string, respuesta: string) => Promise<void>;
  desbloquear: (clave: string) => Promise<boolean>;
  recuperar: (respuesta: string) => Promise<boolean>;
  restablecer: (nuevaClave: string) => Promise<void>;
  bloquear: () => void;
  agregarEntrada: (entrada: PasswordEntry) => Promise<void>;
  actualizarEntrada: (entrada: PasswordEntry) => Promise<void>;
  eliminarEntrada: (id: string) => Promise<void>;
  exportarRespaldo: () => EncryptedStorage | null;
  importarRespaldo: (storage: EncryptedStorage) => Promise<void>;
  purgarTodo: () => Promise<void>;
  restaurarDesdeNube: (email: string, password: string) => Promise<string | null>;
}

const VaultContext = createContext<VaultContextValue | undefined>(undefined);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoApp>('cargando');
  const [entradas, setEntradas] = useState<PasswordEntry[]>([]);
  const [intentosRestantes, setIntentosRestantes] = useState(MAX_INTENTOS);
  const [preguntaRecuperacion, setPreguntaRecuperacion] = useState('');
  const storageRef = useRef<EncryptedStorage | null>(null);
  const claveBovedaRef = useRef<CryptoKey | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      const storage = await cargarBoveda();
      if (!storage) {
        setEstado('configuracion');
        return;
      }
      storageRef.current = storage;
      setPreguntaRecuperacion(storage.recoveryQuestion);
      const fallidos = await obtenerIntentosFallidos();
      setIntentosRestantes(Math.max(0, MAX_INTENTOS - fallidos));
      setEstado('bloqueado');
    })();
  }, []);

  const marcarLocal = () => {
    localStorage.setItem('cerrojo_local_updated', new Date().toISOString());
  };

  const sincronizar = async () => {
    const clave = claveBovedaRef.current;
    const local = storageRef.current;
    if (!clave || !local) return;

    const remoto = await descargarBovedaConFecha();
    const marcaLocal = localStorage.getItem('cerrojo_local_updated') ?? '';
    const tLocal = marcaLocal ? new Date(marcaLocal).getTime() : 0;

    if (!remoto) {
      const err = await subirBoveda(local);
      if (!err) marcarLocal();
      return;
    }

    const tRemoto = new Date(remoto.fecha).getTime();

    if (tRemoto > tLocal) {
      try {
        const entradasRemotas = await descifrarEntradas(clave, remoto.storage);
        storageRef.current = remoto.storage;
        await guardarBoveda(remoto.storage);
        setEntradas(entradasRemotas);
        marcarLocal();
        showToast('success', 'Bóveda sincronizada desde la nube.');
      } catch {
        showToast('warning', 'Hay una copia más reciente en la nube protegida con otra clave maestra. Usa «Descargar bóveda» para restaurarla.');
      }
    } else if (tLocal > tRemoto) {
      const err = await subirBoveda(local);
      if (!err) marcarLocal();
    }
  };

  const persistir = async (nuevas: PasswordEntry[]) => {
    const actualizado = await cifrarEntradasEnStorage(
      storageRef.current!,
      claveBovedaRef.current!,
      nuevas,
    );
    storageRef.current = actualizado;
    await guardarBoveda(actualizado);
    setEntradas(nuevas);
    marcarLocal();
    const err = await subirSiHaySesion(actualizado);
    if (!err) marcarLocal();
  };

  const value: VaultContextValue = {
    estado,
    entradas,
    intentosRestantes,
    preguntaRecuperacion,

    configurar: async (clave, pregunta, respuesta) => {
      const resultado = await crearBoveda(clave, pregunta, respuesta);
      storageRef.current = resultado.storage;
      claveBovedaRef.current = resultado.claveBoveda;
      await guardarBoveda(resultado.storage);
      await fijarIntentosFallidos(0);
      setEntradas([]);
      setIntentosRestantes(MAX_INTENTOS);
      setEstado('desbloqueado');
      marcarLocal();
      void subirSiHaySesion(resultado.storage);
      showToast('success', 'Bóveda creada correctamente. ¡Bienvenido a Cerrojo!');
    },

    desbloquear: async (clave) => {
      const storage = storageRef.current;
      if (!storage) return false;

      const resultado = await desbloquearBoveda(storage, clave);
      if (!resultado) {
        const fallidos = (await obtenerIntentosFallidos()) + 1;
        await fijarIntentosFallidos(fallidos);
        const restantes = MAX_INTENTOS - fallidos;

        if (restantes <= 0) {
          await purgaTotal();
          storageRef.current = null;
          claveBovedaRef.current = null;
          setEntradas([]);
          setEstado('configuracion');
          showToast('error', 'Demasiados intentos fallidos. La bóveda local se ha eliminado por seguridad.');
          return false;
        }

        setIntentosRestantes(restantes);
        if (restantes <= 3) {
          showToast('warning', `Clave incorrecta. Te quedan ${restantes} intentos antes de la autodestrucción de la bóveda local.`);
        } else {
          showToast('error', 'Clave maestra incorrecta.');
        }
        return false;
      }

      claveBovedaRef.current = resultado.claveBoveda;
      setEntradas(resultado.entradas);
      await fijarIntentosFallidos(0);
      setIntentosRestantes(MAX_INTENTOS);
      setEstado('desbloqueado');
      void sincronizar();
      return true;
    },

    recuperar: async (respuesta) => {
      const storage = storageRef.current;
      if (!storage) return false;
      const clave = await recuperarConRespuesta(storage, respuesta);
      if (!clave) {
        showToast('error', 'La respuesta no es correcta.');
        return false;
      }
      claveBovedaRef.current = clave;
      setEstado('restablecer');
      return true;
    },

    restablecer: async (nuevaClave) => {
      const storage = storageRef.current;
      const claveBoveda = claveBovedaRef.current;
      if (!storage || !claveBoveda) return;

      const nuevo = await restablecerClaveMaestra(storage, nuevaClave, claveBoveda);
      storageRef.current = nuevo;
      await guardarBoveda(nuevo);
      await fijarIntentosFallidos(0);
      setIntentosRestantes(MAX_INTENTOS);
      setEntradas(await descifrarEntradas(claveBoveda, nuevo));
      setEstado('desbloqueado');
      marcarLocal();
      showToast('success', 'Clave maestra restablecida correctamente.');
    },

    bloquear: () => {
      claveBovedaRef.current = null;
      setEntradas([]);
      setEstado('bloqueado');
    },

    agregarEntrada: async (entrada) => {
      await persistir([...entradas, entrada]);
    },
    actualizarEntrada: async (entrada) => {
      await persistir(entradas.map((e) => (e.id === entrada.id ? entrada : e)));
    },
    eliminarEntrada: async (id) => {
      await persistir(entradas.filter((e) => e.id !== id));
    },

    exportarRespaldo: () => storageRef.current,

    importarRespaldo: async (storage) => {
      storageRef.current = storage;
      claveBovedaRef.current = null;
      setEntradas([]);
      setPreguntaRecuperacion(storage.recoveryQuestion);
      await guardarBoveda(storage);
      await fijarIntentosFallidos(0);
      setIntentosRestantes(MAX_INTENTOS);
      setEstado('bloqueado');
      marcarLocal();
      showToast('success', 'Respaldo importado. Introduce su clave maestra.');
    },

    purgarTodo: async () => {
      await purgaTotal();
      storageRef.current = null;
      claveBovedaRef.current = null;
      setEntradas([]);
      setEstado('configuracion');
      showToast('success', 'Todos los datos han sido eliminados de este dispositivo.');
    },

    // NUEVA FUNCIÓN: restaurar bóveda desde la nube
    restaurarDesdeNube: async (email, password) => {
      // 1. Iniciar sesión en Supabase
      const errorLogin = await entrarNube(email, password);
      if (errorLogin) return errorLogin;

      // 2. Descargar la bóveda cifrada
      const remoto = await descargarBovedaConFecha();
      if (!remoto) {
        return 'No se encontró ninguna bóveda en la nube para esta cuenta.';
      }

      // 3. Guardarla localmente (sin descifrar aún)
      storageRef.current = remoto.storage;
      claveBovedaRef.current = null;
      setEntradas([]);
      setPreguntaRecuperacion(remoto.storage.recoveryQuestion);
      await guardarBoveda(remoto.storage);
      await fijarIntentosFallidos(0);
      setIntentosRestantes(MAX_INTENTOS);
      marcarLocal();

      // 4. Pasar a estado 'bloqueado' para pedir la clave maestra
      setEstado('bloqueado');
      showToast('success', 'Bóveda descargada de la nube. Introduce tu clave maestra.');
      return null;
    },
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const contexto = useContext(VaultContext);
  if (!contexto) {
    throw new Error('useVault debe usarse dentro de <VaultProvider>');
  }
  return contexto;
}