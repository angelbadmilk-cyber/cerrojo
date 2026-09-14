import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { EncryptedStorage } from '../types';
import { auth, db, nubeConfigurada } from './firebaseClient';

// --- Autenticación ---

export async function emailSesion(): Promise<string | null> {
  if (!auth) return null;
  return auth.currentUser?.email ?? null;
}

export async function registrarNube(email: string, password: string): Promise<string | null> {
  if (!auth) return 'La nube no está configurada.';
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return null;
  } catch (err) {
    return traducirError(err);
  }
}

export async function entrarNube(email: string, password: string): Promise<string | null> {
  if (!auth) return 'La nube no está configurada.';
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return null;
  } catch (err) {
    return traducirError(err);
  }
}

export async function salirNube(): Promise<void> {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch {
    // Ignoramos errores al cerrar sesión
  }
}

// --- Sincronización de la bóveda ---

export async function subirBoveda(storage: EncryptedStorage): Promise<string | null> {
  if (!auth || !db) return 'La nube no está configurada.';
  const userId = auth.currentUser?.uid;
  if (!userId) return 'No hay sesión en la nube.';

  try {
    await setDoc(doc(db, 'vaults', userId), {
      storage,
      updated_at: new Date().toISOString(),
    });
    localStorage.setItem('cerrojo_last_sync', new Date().toISOString());
    return null;
  } catch (err) {
    return traducirError(err);
  }
}

// Sube automáticamente si hay sesión abierta; devuelve el error o null
export async function subirSiHaySesion(storage: EncryptedStorage): Promise<string | null> {
  if (!auth) return null;
  if (!auth.currentUser) return null;
  return subirBoveda(storage);
}

export async function descargarBoveda(): Promise<EncryptedStorage | null> {
  const remoto = await descargarBovedaConFecha();
  return remoto ? remoto.storage : null;
}

// Devuelve la copia de la nube junto con la fecha en que se subió
export async function descargarBovedaConFecha(): Promise<{
  storage: EncryptedStorage;
  fecha: string;
} | null> {
  if (!auth || !db) return null;
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  try {
    const snap = await getDoc(doc(db, 'vaults', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      storage: data.storage as EncryptedStorage,
      fecha: String(data.updated_at),
    };
  } catch {
    return null;
  }
}

export function ultimaSincronizacion(): string | null {
  return localStorage.getItem('cerrojo_last_sync');
}

// --- Utilidades ---

// Traduce los errores comunes de Firebase a mensajes legibles en español
function traducirError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este correo ya está registrado.';
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil (mínimo 6 caracteres).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/network-request-failed':
      return 'Sin conexión a internet.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos.';
    default:
      return (err as { message?: string })?.message ?? 'Error desconocido.';
  }
}

// Exportamos también por si algún componente quiere saber si la nube está configurada
export { nubeConfigurada };