import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, Save } from 'lucide-react';
import type { Category, PasswordEntry } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useVault } from '../contexts/VaultContext';
import { CATEGORIAS } from '../services/uiService';
import Modal from './Modal';
import PasswordGenerator from './PasswordGenerator';

interface PasswordFormProps {
  inicial: PasswordEntry | null;
  onClose: () => void;
}

export default function PasswordForm({ inicial, onClose }: PasswordFormProps) {
  const { agregarEntrada, actualizarEntrada } = useVault();
  const { showToast } = useToast();
  const [tipo, setTipo] = useState<'password' | 'document'>(inicial?.type ?? 'password');
  const [siteName, setSiteName] = useState(inicial?.siteName ?? '');
  const [username, setUsername] = useState(inicial?.username ?? '');
  const [password, setPassword] = useState(inicial?.password ?? '');
  const [verClave, setVerClave] = useState(false);
  const [url, setUrl] = useState(inicial?.url ?? '');
  const [category, setCategory] = useState<Category>(inicial?.category ?? 'personal');
  const [tags, setTags] = useState((inicial?.tags ?? []).join(', '));
  const [totpSecret, setTotpSecret] = useState(inicial?.totpSecret ?? '');
  const [attachment, setAttachment] = useState(inicial?.attachment);
  const [fileName, setFileName] = useState(inicial?.fileName);
  const [fileType, setFileType] = useState(inicial?.fileType);
  const [cargando, setCargando] = useState(false);

  const leerArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 2 * 1024 * 1024) {
      showToast('warning', 'El archivo supera los 2 MB permitidos.');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      const dataUrl = String(lector.result);
      setAttachment(dataUrl.split(',')[1]);
      setFileName(archivo.name);
      setFileType(archivo.type);
    };
    lector.readAsDataURL(archivo);
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    const ahora = new Date().toISOString();
    const entrada: PasswordEntry = {
      id: inicial?.id ?? crypto.randomUUID(),
      type: tipo,
      siteName: siteName.trim(),
      username: username.trim(),
      password: tipo === 'password' ? password : '',
      url: url.trim() || undefined,
      totpSecret: tipo === 'password' ? totpSecret.trim() || undefined : undefined,
      category,
      tags: Array.from(new Set(tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))),
      createdAt: inicial?.createdAt ?? ahora,
      updatedAt: ahora,
      attachment: tipo === 'document' ? attachment : undefined,
      fileName: tipo === 'document' ? fileName : undefined,
      fileType: tipo === 'document' ? fileType : undefined,
      favorite: inicial?.favorite ?? false,
    };
    setCargando(true);
    if (inicial) await actualizarEntrada(entrada);
    else await agregarEntrada(entrada);
    showToast('success', inicial ? 'Cambios guardados.' : 'Entrada añadida a tu bóveda.');
    setCargando(false);
    onClose();
  };

  return (
    <Modal titulo={inicial ? 'Editar entrada' : 'Nueva entrada'} onClose={onClose}>
      <form onSubmit={enviar} className="space-y-4">
        <div className="flex gap-2" role="group" aria-label="Tipo de entrada">
          <button
            type="button"
            onClick={() => setTipo('password')}
            className={`h-11 flex-1 rounded-button text-sm font-medium transition-colors ${
              tipo === 'password'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
            aria-pressed={tipo === 'password'}
          >
            Contraseña
          </button>
          <button
            type="button"
            onClick={() => setTipo('document')}
            className={`h-11 flex-1 rounded-button text-sm font-medium transition-colors ${
              tipo === 'document'
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
            aria-pressed={tipo === 'document'}
          >
            Documento
          </button>
        </div>

        <div>
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium">Nombre *</label>
          <input id="nombre" className="input-field" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Por ejemplo: Gmail" autoFocus required />
        </div>

        <div>
          <label htmlFor="usuario" className="mb-2 block text-sm font-medium">Usuario o correo</label>
          <input id="usuario" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu@correo.com" />
        </div>

        {tipo === 'password' && (
          <>
            <div>
              <label htmlFor="contrasena" className="mb-2 block text-sm font-medium">Contraseña *</label>
              <div className="relative">
                <input id="contrasena" type={verClave ? 'text' : 'password'} className="input-field pr-14" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setVerClave(!verClave)} className="btn-ghost absolute right-1 top-1/2 -translate-y-1/2" aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {verClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <PasswordGenerator onUsar={setPassword} />
            <div>
              <label htmlFor="url" className="mb-2 block text-sm font-medium">Sitio web</label>
              <input id="url" className="input-field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="totp" className="mb-2 block text-sm font-medium">Secreto 2FA (TOTP), opcional</label>
              <input id="totp" className="input-field" value={totpSecret} onChange={(e) => setTotpSecret(e.target.value)} placeholder="JBSWY3DPEHPK3PXP" />
            </div>
          </>
        )}

        {tipo === 'document' && (
          <div>
            <label htmlFor="archivo" className="mb-2 block text-sm font-medium">Archivo (máx. 2 MB)</label>
            <input id="archivo" type="file" onChange={leerArchivo} className="input-field h-auto py-2.5" />
            {fileName && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Seleccionado: {fileName}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="categoria" className="mb-2 block text-sm font-medium">Categoría</label>
            <select id="categoria" className="input-field" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>{c.etiqueta}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="etiquetas" className="mb-2 block text-sm font-medium">Etiquetas (separadas por comas)</label>
            <input id="etiquetas" className="input-field" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="correo, principal" />
          </div>
        </div>

        <button type="submit" disabled={cargando} className="btn-primary w-full">
          <Save className="h-4 w-4" />
          {inicial ? 'Guardar cambios' : 'Añadir a la bóveda'}
        </button>
      </form>
    </Modal>
  );
}