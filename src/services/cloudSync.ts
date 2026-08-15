import type { EncryptedStorage } from '../types';
import { supabase } from './supabaseClient';

export async function emailSesion(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.email ?? null;
}

export async function registrarNube(email: string, password: string): Promise<string | null> {
  if (!supabase) return 'La nube no está configurada.';
  const { error } = await supabase.auth.signUp({ email, password });
  return error ? error.message : null;
}

export async function entrarNube(email: string, password: string): Promise<string | null> {
  if (!supabase) return 'La nube no está configurada.';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

export async function salirNube(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function subirBoveda(storage: EncryptedStorage): Promise<string | null> {
  if (!supabase) return 'La nube no está configurada.';
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return 'No hay sesión en la nube.';

  const { error } = await supabase
    .from('vaults')
    .upsert({ user_id: userId, storage, updated_at: new Date().toISOString() });

  if (error) return error.message;
  localStorage.setItem('cerrojo_last_sync', new Date().toISOString());
  return null;
}

// Sube automáticamente si hay sesión abierta; devuelve el error o null
export async function subirSiHaySesion(storage: EncryptedStorage): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  return subirBoveda(storage);
}

export async function descargarBoveda(): Promise<EncryptedStorage | null> {
  const remoto = await descargarBovedaConFecha();
  return remoto ? remoto.storage : null;
}

// Devuelve la copia de la nube junto con la fecha en que se subió
export async function descargarBovedaConFecha(): Promise<{ storage: EncryptedStorage; fecha: string } | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;

  const { data: fila } = await supabase
    .from('vaults')
    .select('storage, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (!fila) return null;
  return { storage: fila.storage as EncryptedStorage, fecha: String(fila.updated_at) };
}

export function ultimaSincronizacion(): string | null {
  return localStorage.getItem('cerrojo_last_sync');
}