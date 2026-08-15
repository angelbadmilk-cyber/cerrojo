import { argon2id } from 'hash-wasm';
import type { EncryptedStorage, PasswordEntry } from '../types';

const MAGIA = 'CERROJO_VERIFICADOR_OK';

// ---------- Base64 ----------
export function toBase64(bytes: Uint8Array): string {
  let binario = '';
  bytes.forEach((b) => {
    binario += String.fromCharCode(b);
  });
  return btoa(binario);
}

export function fromBase64(texto: string): Uint8Array {
  const binario = atob(texto);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

// ---------- Aleatoriedad ----------
function aleatorios(longitud: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(longitud));
}

function enteroAleatorio(max: number): number {
  const limite = 256 - (256 % max);
  const buf = new Uint8Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limite);
  return buf[0] % max;
}

// ---------- Derivación y claves ----------
async function importarAES(bytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    bytes as BufferSource,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  );
}

export async function derivarClave(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = (await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 32 * 1024, // 32 MB
    hashLength: 32,
    outputType: 'binary',
  })) as unknown as Uint8Array;
  return importarAES(material);
}

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// ---------- AES-GCM con IV embebido ----------
async function cifrarPaquete(clave: CryptoKey, datos: Uint8Array): Promise<string> {
  const iv = aleatorios(12);
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    clave,
    datos as BufferSource,
  );
  const salida = new Uint8Array(iv.length + cifrado.byteLength);
  salida.set(iv, 0);
  salida.set(new Uint8Array(cifrado), iv.length);
  return toBase64(salida);
}

async function descifrarPaquete(clave: CryptoKey, paquete: string): Promise<Uint8Array> {
  const datos = fromBase64(paquete);
  const iv = datos.slice(0, 12);
  const cifrado = datos.slice(12);
  const claro = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    clave,
    cifrado as BufferSource,
  );
  return new Uint8Array(claro);
}

// ---------- Operaciones de bóveda ----------
export async function crearBoveda(
  claveMaestra: string,
  pregunta: string,
  respuesta: string,
): Promise<{ storage: EncryptedStorage; claveBoveda: CryptoKey }> {
  const salt = aleatorios(16);
  const claveDerivada = await derivarClave(claveMaestra, salt);

  const bytesBoveda = aleatorios(32);
  const claveBoveda = await importarAES(bytesBoveda);

  const wrappedKey = await cifrarPaquete(claveDerivada, bytesBoveda);
  const verifier = await cifrarPaquete(
    claveDerivada,
    new TextEncoder().encode(MAGIA),
  );

  const recoverySalt = aleatorios(16);
  const claveRecuperacion = await derivarClave(normalizar(respuesta), recoverySalt);
  const recoveryWrappedKey = await cifrarPaquete(claveRecuperacion, bytesBoveda);

  const iv = aleatorios(12);
  const claro = new TextEncoder().encode(JSON.stringify([]));
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    claveBoveda,
    claro as BufferSource,
  );

  const storage: EncryptedStorage = {
    salt: toBase64(salt),
    iv: toBase64(iv),
    encryptedVault: toBase64(new Uint8Array(cifrado)),
    wrappedKey,
    recoverySalt: toBase64(recoverySalt),
    recoveryIv: toBase64(iv),
    recoveryWrappedKey,
    recoveryQuestion: pregunta,
    verifier,
  };

  return { storage, claveBoveda };
}

export async function desbloquearBoveda(
  storage: EncryptedStorage,
  password: string,
): Promise<{ claveBoveda: CryptoKey; entradas: PasswordEntry[] } | null> {
  try {
    const claveDerivada = await derivarClave(password, fromBase64(storage.salt));
    const verificador = await descifrarPaquete(claveDerivada, storage.verifier);
    if (new TextDecoder().decode(verificador) !== MAGIA) return null;

    const bytesBoveda = await descifrarPaquete(claveDerivada, storage.wrappedKey);
    const claveBoveda = await importarAES(bytesBoveda);
    const entradas = await descifrarEntradas(claveBoveda, storage);
    return { claveBoveda, entradas };
  } catch {
    return null;
  }
}

export async function descifrarEntradas(
  claveBoveda: CryptoKey,
  storage: EncryptedStorage,
): Promise<PasswordEntry[]> {
  const claro = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(storage.iv) as BufferSource },
    claveBoveda,
    fromBase64(storage.encryptedVault) as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(claro)) as PasswordEntry[];
}

export async function cifrarEntradasEnStorage(
  storage: EncryptedStorage,
  claveBoveda: CryptoKey,
  entradas: PasswordEntry[],
): Promise<EncryptedStorage> {
  const iv = aleatorios(12);
  const claro = new TextEncoder().encode(JSON.stringify(entradas));
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    claveBoveda,
    claro as BufferSource,
  );
  return {
    ...storage,
    iv: toBase64(iv),
    encryptedVault: toBase64(new Uint8Array(cifrado)),
  };
}

export async function recuperarConRespuesta(
  storage: EncryptedStorage,
  respuesta: string,
): Promise<CryptoKey | null> {
  try {
    const claveRecuperacion = await derivarClave(
      normalizar(respuesta),
      fromBase64(storage.recoverySalt),
    );
    const bytesBoveda = await descifrarPaquete(claveRecuperacion, storage.recoveryWrappedKey);
    return await importarAES(bytesBoveda);
  } catch {
    return null;
  }
}

export async function restablecerClaveMaestra(
  storage: EncryptedStorage,
  nuevaClave: string,
  claveBoveda: CryptoKey,
): Promise<EncryptedStorage> {
  const salt = aleatorios(16);
  const claveDerivada = await derivarClave(nuevaClave, salt);
  const bytesBoveda = new Uint8Array(await crypto.subtle.exportKey('raw', claveBoveda));
  const wrappedKey = await cifrarPaquete(claveDerivada, bytesBoveda);
  const verifier = await cifrarPaquete(claveDerivada, new TextEncoder().encode(MAGIA));
  return { ...storage, salt: toBase64(salt), wrappedKey, verifier };
}

// ---------- Generador de contraseñas ----------
export interface OpcionesGenerador {
  longitud: number;
  mayusculas: boolean;
  numeros: boolean;
  simbolos: boolean;
}

const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
const MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMEROS = '0123456789';
const SIMBOLOS = '!@#$%^&*()-_=+[]{};:,.<>?';

export function generarPassword(opciones: OpcionesGenerador): string {
  const grupos: string[] = [MINUSCULAS];
  if (opciones.mayusculas) grupos.push(MAYUSCULAS);
  if (opciones.numeros) grupos.push(NUMEROS);
  if (opciones.simbolos) grupos.push(SIMBOLOS);

  const todos = grupos.join('');
  const resultado: string[] = [];

  for (const grupo of grupos) {
    resultado.push(grupo[enteroAleatorio(grupo.length)]);
  }
  while (resultado.length < opciones.longitud) {
    resultado.push(todos[enteroAleatorio(todos.length)]);
  }

  for (let i = resultado.length - 1; i > 0; i -= 1) {
    const j = enteroAleatorio(i + 1);
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }

  return resultado.slice(0, opciones.longitud).join('');
}