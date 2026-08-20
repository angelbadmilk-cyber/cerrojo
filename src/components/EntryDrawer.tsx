import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Copy, Download, Eye, EyeOff, ExternalLink, Pencil, Star, Trash2, X, FileText } from 'lucide-react';
import type { PasswordEntry } from '../types';
import { useToast } from '../contexts/ToastContext';
import { avatarDe, colorCategoria, copiarAlPortapapeles, etiquetaCategoria, fechaRelativa } from '../services/uiService';
import TOTPDisplay from './TOTPDisplay';

interface EntryDrawerProps {
  entrada: PasswordEntry;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-400">{etiqueta}</p>
      {children}
    </div>
  );
}

export default function EntryDrawer({ entrada, onClose, onEdit, onDelete, onToggleFavorite }: EntryDrawerProps) {
  const { showToast } = useToast();
  const [verClave, setVerClave] = useState(false);
  const [verNota, setVerNota] = useState(false);
  const avatar = avatarDe(entrada.siteName);

  useEffect(() => {
    const manejar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', manejar);
    return () => document.removeEventListener('keydown', manejar);
  }, [onClose]);

  const copiar = async (texto: string, mensaje: string) => {
    await copiarAlPortapapeles(texto);
    showToast('success', mensaje);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Detalles de ${entrada.siteName}`}>
      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] text-base font-semibold text-white" style={{ backgroundColor: avatar.color }}>
            {avatar.iniciales}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-white">{entrada.siteName}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorCategoria(entrada.category)}`}>
              {etiquetaCategoria(entrada.category)}
            </span>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" aria-label="Cerrar panel">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {entrada.type === 'password' && (
            <>
              {entrada.username && (
                <Fila etiqueta="Usuario">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-input bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">{entrada.username}</code>
                    <button type="button" className="btn-ghost" onClick={() => copiar(entrada.username, 'Usuario copiado.')} aria-label="Copiar usuario">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </Fila>
              )}

              {entrada.password && (
                <Fila etiqueta="Contraseña">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-input bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
                      {verClave ? entrada.password : '••••••••••••'}
                    </code>
                    <button type="button" className="btn-ghost" onClick={() => setVerClave(!verClave)} aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {verClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => copiar(entrada.password, 'Contraseña copiada. El portapapeles se limpiará en 30 s.')} aria-label="Copiar contraseña">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </Fila>
              )}

              {entrada.totpSecret && (
                <Fila etiqueta="Código 2FA (TOTP)">
                  <TOTPDisplay secret={entrada.totpSecret} />
                </Fila>
              )}

              {entrada.url && (
                <Fila etiqueta="Sitio web">
                  <a href={entrada.url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400">
                    <span className="truncate">{entrada.url}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                </Fila>
              )}
            </>
          )}

          {entrada.type === 'note' && (
            <>
              {entrada.username && (
                <Fila etiqueta="Asociado a">
                  <code className="block truncate rounded-input bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">{entrada.username}</code>
                </Fila>
              )}
              <Fila etiqueta="Contenido de la nota">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVerNota(!verNota)}
                      className="btn-secondary flex-1 justify-center"
                    >
                      {verNota ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {verNota ? 'Ocultar contenido' : 'Mostrar contenido'}
                    </button>
                    <button
                      type="button"
                      onClick={() => entrada.content && copiar(entrada.content, 'Nota copiada. El portapapeles se limpiará en 30 s.')}
                      className="btn-ghost"
                      aria-label="Copiar nota"
                      disabled={!entrada.content}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {verNota && entrada.content && (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-input bg-slate-100 p-3 font-mono text-sm dark:bg-slate-800">
                      {entrada.content}
                    </pre>
                  )}
                  {!verNota && (
                    <div className="flex items-center gap-2 rounded-input bg-slate-100 px-3 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <FileText className="h-4 w-4" />
                      Pulsa «Mostrar contenido» para revelar la nota cifrada.
                    </div>
                  )}
                </div>
              </Fila>
            </>
          )}

          {entrada.type === 'document' && (
            <>
              {entrada.attachment && (
                <Fila etiqueta="Documento">
                  <a
                    href={`data:${entrada.fileType ?? 'application/octet-stream'};base64,${entrada.attachment}`}
                    download={entrada.fileName ?? 'documento'}
                    className="inline-flex items-center gap-2 rounded-input border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    {entrada.fileName ?? 'Descargar'}
                  </a>
                </Fila>
              )}
              {entrada.fileType && (
                <Fila etiqueta="Tipo de archivo">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{entrada.fileType}</p>
                </Fila>
              )}
            </>
          )}

          {entrada.tags.length > 0 && (
            <Fila etiqueta="Etiquetas">
              <div className="flex flex-wrap gap-1.5">
                {entrada.tags.map((t) => (
                  <span key={t} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>
            </Fila>
          )}

          <Fila etiqueta="Actualizado">
            <p className="text-sm text-slate-600 dark:text-slate-300">{fechaRelativa(entrada.updatedAt)}</p>
          </Fila>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <button type="button" onClick={onEdit} className="btn-secondary flex-1">
            <Pencil className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            className={`btn-ghost ${entrada.favorite ? 'text-amber-400' : ''}`}
            aria-label={entrada.favorite ? 'Quitar de favoritas' : 'Añadir a favoritas'}
          >
            <Star className={`h-5 w-5 ${entrada.favorite ? 'fill-amber-400' : ''}`} />
          </button>
          <button type="button" onClick={onDelete} className="btn-ghost text-red-600 dark:text-red-400" aria-label="Eliminar entrada">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </div>
  );
}