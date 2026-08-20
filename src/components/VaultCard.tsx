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

function obtenerDominio(url: string | undefined): string | null {
  if (!url) return null;
  try {
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    return new URL(u).hostname;
  } catch {
    return null;
  }
}

// Cadena de favicons: mismo origen primero (sin CORS), luego servicios CORS-friendly
function urlsFavicon(dominio: string): string[] {
  return [
    `https://${dominio}/favicon.ico`, // Mismo origen, no CORS
    `https://favicon.im/${dominio}`, // Permite CORS
    `https://unavatar.io/${dominio}?fallback=false`, // Permite CORS
    `https://icons.duckduckgo.com/ip3/${dominio}.ico`,
    `https://www.google.com/s2/favicons?domain=${dominio}&sz=64`,
  ];
}

export default function VaultCard({ entrada, vista, conFavicons, onOpen }: VaultCardProps) {
  const avatar = avatarDe(entrada.siteName);
  const [copiado, setCopiado] = useState<'user' | 'pass' | null>(null);
  const [indiceFavicon, setIndiceFavicon] = useState(0);
  const [faviconFallo, setFaviconFallo] = useState(false);

  const dominio = obtenerDominio(entrada.url);
  const mostrarFavicon = conFavicons && dominio !== null && !faviconFallo;
  const urls = dominio ? urlsFavicon(dominio) : [];

  const Avatar = mostrarFavicon ? (
    <img
      key={`${dominio}-${indiceFavicon}`}
      src={urls[indiceFavicon]}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => {
        if (indiceFavicon + 1 < urls.length) {
          setIndiceFavicon(indiceFavicon + 1);
        } else {
          setFaviconFallo(true);
        }
      }}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-50 object-contain p-1.5 dark:border-slate-700 dark:bg-slate-800"
    />
  ) : (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-sm font-semibold text-white"
      style={{ backgroundColor: avatar.color }}
    >
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
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        className="card flex w-full cursor-pointer flex-col items-start gap-3 p-5 text-left hover:shadow-md"
      >
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
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="card flex w-full cursor-pointer items-center gap-4 p-4 text-left hover:shadow-md"
    >
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
    </div>
  );
}