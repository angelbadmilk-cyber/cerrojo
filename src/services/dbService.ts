import { openDB, deleteDB } from 'idb';
import type { IDBPDatabase } from 'idb';
import type { AppSettings, EncryptedStorage } from '../types';

const NOMBRE_DB = 'cerrojo-db';
const VERSION_DB = 1;

export const AJUSTES_POR_DEFECTO: AppSettings = {
  themeMode: 'system',
  themeColor: 'blue',
  autoLockTimeout: 5,
  biometricsEnabled: false,
  viewMode: 'list',
  faviconsEnabled: false,
};

let promesaDB: Promise<IDBPDatabase> | null = null;

function obtenerDB(): Promise<IDBPDatabase> {
  if (!promesaDB) {
    promesaDB = openDB(NOMBRE_DB, VERSION_DB, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vault')) db.createObjectStore('vault');
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
        if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      },
    });
  }
  return promesaDB;
}

// ---------- Bóveda ----------
export async function guardarBoveda(storage: EncryptedStorage): Promise<void> {
  const db = await obtenerDB();
  await db.put('vault', storage, 'primary');
}

export async function cargarBoveda(): Promise<EncryptedStorage | undefined> {
  const db = await obtenerDB();
  return db.get('vault', 'primary');
}

// ---------- Intentos fallidos ----------
export async function obtenerIntentosFallidos(): Promise<number> {
  const db = await obtenerDB();
  const valor = await db.get('meta', 'intentos');
  return typeof valor === 'number' ? valor : 0;
}

export async function fijarIntentosFallidos(intentos: number): Promise<void> {
  const db = await obtenerDB();
  await db.put('meta', intentos, 'intentos');
}

// ---------- Ajustes ----------
export async function obtenerAjustes(): Promise<AppSettings> {
  const db = await obtenerDB();
  const guardados = await db.get('settings', 'app');
  return { ...AJUSTES_POR_DEFECTO, ...(guardados ?? {}) };
}

export async function guardarAjustes(ajustes: AppSettings): Promise<void> {
  const db = await obtenerDB();
  await db.put('settings', ajustes, 'app');
}

// ---------- Purga total (borrado físico de IndexedDB) ----------
export async function purgaTotal(): Promise<void> {
  const db = await obtenerDB();
  db.close();
  promesaDB = null;
  await deleteDB(NOMBRE_DB);
}