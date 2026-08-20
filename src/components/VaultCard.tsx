import { useState } from 'react';
import { Copy, Check, Star } from 'lucide-react';
import type { PasswordEntry } from '../types';
import { avatarDe, colorCategoria, copiarAlPortapapeles, etiquetaCategoria, fechaRelativa } from '../services/uiService';

interface VaultCardProps {
  entrada: PasswordEntry;
  vista: 'list' | 'grid';
  conFavicons: boolean;
  onOpen: () => void;
}

export default function VaultCard({ entrada, vista, conFavicons, onOpen }: VaultCardProps) {
  const avatar = avatarDe(entrada.siteName);
  const [errorFavicon, setErrorFavicon] = useState(false);
  const [copiado, setCopiado] = useState<'user' | 'pass' | null>(null);

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
      src={`https://icon.horse/icon/${dominio}`}
      alt=""
      onError={() => setErrorFavicon(true)}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-slate-200 bg-white object-contain p-2 dark:border-slate-700"
    />
  ) : (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-sm font-semibold text-white" style={{ backgroundColor: avatar.color }}>
      {avatar.iniciales}
    </div>
  );

  const copiar = async (e: React.MouseEvent, texto: string, tipo: 'user' | 'pass') => {
    e.stopPropagation();
    await copiarAlPortapapeles(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 1200);
  };

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
        <div className="flex w-full items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorCategoria(entrada.category)}`}>
            {etiquetaCategoria(entrada.category)}
          </span>
          {entrada.type === 'password' && (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {entrada.username && (
                <button
                  type="button"
                  onClick={(e) => void copiar(e, entrada.username, 'user')}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Copiar usuario"
                  title="Copiar usuario"
                >
                  {copiado === 'user' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
              {entrada.password && (
                <button
                  type="button"
                  onClick={(e) => void copiar(e, entrada.password, 'pass')}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Copiar contraseña"
                  title="Copiar contraseña"
                >
                  {copiado === 'pass' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          )}
        </div>
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
      {entrada.type === 'password' && (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {entrada.username && (
            <button
              type="button"
              onClick={(e) => void copiar(e, entrada.username, 'user')}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Copiar usuario"
              title="Copiar usuario"
            >
              {copiado === 'user' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
          {entrada.password && (
            <button
              type="button"
              onClick={(e) => void copiar(e, entrada.password, 'pass')}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Copiar contraseña"
              title="Copiar contraseña"
            >
              {copiado === 'pass' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}
      <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-block ${colorCategoria(entrada.category)}`}>
        {etiquetaCategoria(entrada.category)}
      </span>
      <span className="hidden text-xs text-slate-400 md:inline-block">{fechaRelativa(entrada.updatedAt)}</span>
    </button>
  );
}