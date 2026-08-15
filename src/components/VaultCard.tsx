import { useState } from 'react';
import { Star } from 'lucide-react';
import type { PasswordEntry } from '../types';
import { avatarDe, colorCategoria, etiquetaCategoria, fechaRelativa } from '../services/uiService';

interface VaultCardProps {
  entrada: PasswordEntry;
  vista: 'list' | 'grid';
  conFavicons: boolean;
  onOpen: () => void;
}

export default function VaultCard({ entrada, vista, conFavicons, onOpen }: VaultCardProps) {
  const avatar = avatarDe(entrada.siteName);
  const [errorFavicon, setErrorFavicon] = useState(false);

  let dominio: string | null = null;
  if (entrada.url) {
    try {
      dominio = new URL(entrada.url).hostname;
    } catch {
      dominio = null;
    }
  }
  const mostrarFavicon = conFavicons && dominio !== null && !errorFavicon;

  const Avatar = mostrarFavicon ? (
    <img
      src={`https://www.google.com/s2/favicons?domain=${dominio}&sz=64`}
      alt=""
      onError={() => setErrorFavicon(true)}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-slate-200 bg-white object-contain p-2 dark:border-slate-700"
    />
  ) : (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-sm font-semibold text-white" style={{ backgroundColor: avatar.color }}>
      {avatar.iniciales}
    </div>
  );

  if (vista === 'grid') {
    return (
      <button type="button" onClick={onOpen} className="card flex w-full flex-col items-start gap-3 p-5 text-left hover:shadow-md">
        <div className="flex w-full items-start justify-between">
          {Avatar}
          {entrada.favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Favorita" />}
        </div>
        <div className="w-full min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{entrada.siteName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{entrada.username}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorCategoria(entrada.category)}`}>
          {etiquetaCategoria(entrada.category)}
        </span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onOpen} className="card flex w-full items-center gap-4 p-4 text-left hover:shadow-md">
      {Avatar}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {entrada.siteName}
          {entrada.favorite && <Star className="ml-2 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Favorita" />}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{entrada.username}</p>
      </div>
      <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block ${colorCategoria(entrada.category)}`}>
        {etiquetaCategoria(entrada.category)}
      </span>
      <span className="hidden text-xs text-slate-400 md:inline-block">{fechaRelativa(entrada.updatedAt)}</span>
    </button>
  );
}