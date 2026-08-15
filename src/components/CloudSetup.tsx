import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const SQL = `create table if not exists public.vaults (
  user_id uuid primary key references auth.users(id) on delete cascade,
  storage jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.vaults enable row level security;

create policy "solo_propietario" on public.vaults
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`;

const ENV = `VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLIC`;

export default function CloudSetup() {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(SQL);
    setCopiado(true);
    window.setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sincronización en la nube</h1>

      <div className="card space-y-5 p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Cerrojo funciona 100% sin internet. Si quieres sincronizar entre dispositivos, conecta tu
          propia cuenta gratuita de Supabase. Tu bóveda viaja y se guarda siempre cifrada: el servidor
          solo ve datos ilegibles.
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>Crea una cuenta y un proyecto gratis en supabase.com.</li>
          <li>En tu proyecto, abre SQL Editor, pega el código de abajo y pulsa Run.</li>
          <li>En Authentication → Providers → Email, desactiva «Confirm email».</li>
          <li>En Project Settings → API, copia el Project URL y la clave anon public.</li>
          <li>Crea el archivo .env en la raíz de tu proyecto con esos dos valores y reinicia npm run dev.</li>
        </ol>

        <div className="relative">
          <pre className="overflow-x-auto rounded-input bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {SQL}
          </pre>
          <button
            type="button"
            onClick={() => void copiar()}
            className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-button bg-slate-700 text-slate-200 transition-colors hover:bg-slate-600"
            aria-label="Copiar código SQL"
          >
            {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        <p className="text-sm font-medium text-slate-900 dark:text-white">Contenido del archivo .env:</p>
        <pre className="overflow-x-auto rounded-input bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          {ENV}
        </pre>
      </div>
    </div>
  );
}