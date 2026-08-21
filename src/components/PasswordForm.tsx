import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, Save, FileText, File, KeyRound, Camera } from 'lucide-react';
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

const MAX_DOCUMENTO = 3 * 1024 * 1024;
const MAX_DIMENSION = 2048;

async function comprimirImagen(file: File): Promise<{ base64: string; tipo: string }> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, tipo: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.src = String(lector.result);
    };
    lector.onerror = () => reject(new Error('Error al leer el archivo'));
    lector.readAsDataURL(file);
  });
}

export default function PasswordForm({ inicial, onClose }: PasswordFormProps) {
  const { agregarEntrada, actualizarEntrada } = useVault();
  const { showToast } = useToast();
  const [tipo, setTipo] = useState<'password' | 'document' | 'note'>(inicial?.type ?? 'password');
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
  const [content, setContent] = useState(inicial?.content ?? '');
  const [cargando, setCargando] = useState(false);

  const procesarArchivo = async (archivo: File, nombreForzado?: string) => {
    const esImagen = archivo.type.startsWith('image/');
    const nombreFinal = nombreForzado ?? archivo.name;
    try {
      if (esImagen) {
        const { base64, tipo: tipoImg } = await comprimirImagen(archivo);
        const tamañoFinal = Math.round((base64.length * 3) / 4);
        if (tamañoFinal > MAX_DOCUMENTO) {
          showToast('warning', `La imagen sigue siendo demasiado grande (${(tamañoFinal / 1024 / 1024).toFixed(1)} MB). Prueba con otra.`);
          return;
        }
        setAttachment(base64);
        setFileName(nombreFinal);
        setFileType(tipoImg);
        showToast('success', `Imagen comprimida a ${(tamañoFinal / 1024).toFixed(0)} KB`);
      } else {
        if (archivo.size > MAX_DOCUMENTO) {
          showToast('warning', 'El archivo supera los 3 MB permitidos.');
          return;
        }
        const lector = new FileReader();
        lector.onload = () => {
          const dataUrl = String(lector.result);
          setAttachment(dataUrl.split(',')[1]);
          setFileName(nombreFinal);
          setFileType(archivo.type);
        };
        lector.readAsDataURL(archivo);
      }
    } catch {
      showToast('error', 'No se pudo procesar el archivo.');
    }
  };

  const desdeArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) void procesarArchivo(archivo);
    evento.target.value = '';
  };

  const desdeCamara = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) {
      const fecha = new Date().toISOString().slice(0, 10);
      void procesarArchivo(archivo, `foto_${fecha}.jpg`);
    }
    evento.target.value = '';
  };

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!siteName.trim()) {
      showToast('warning', 'El nombre es obligatorio.');
      return;
    }
    if (tipo === 'password' && !password) {
      showToast('warning', 'La contraseña es obligatoria para este tipo.');
      return;
    }
    if (tipo === 'note' && !content.trim()) {
      showToast('warning', 'El contenido de la nota no puede estar vacío.');
      return;
    }
    if (tipo === 'document' && !attachment) {
      showToast('warning', 'Debes tomar una foto o seleccionar un archivo.');
      return;
    }

    const ahora = new Date().toISOString();
    const entrada: PasswordEntry = {
      id: inicial?.id ?? crypto.randomUUID(),
      type: tipo,
      siteName: siteName.trim(),
      username: tipo === 'document' ? '' : username.trim(),
      password: tipo === 'password' ? password : '',
      url: tipo === 'document' ? undefined : url.trim() || undefined,
      totpSecret: tipo === 'password' ? totpSecret.trim() || undefined : undefined,
      category,
      tags: Array.from(new Set(tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))),
      createdAt: inicial?.createdAt ?? ahora,
      updatedAt: ahora,
      attachment: tipo === 'document' ? attachment : undefined,
      fileName: tipo === 'document' ? fileName : undefined,
      fileType: tipo === 'document' ? fileType : undefined,
      content: tipo === 'note' ? content : undefined,
      favorite: inicial?.favorite ?? false,
    };
    setCargando(true);
    if (inicial) await actualizarEntrada(entrada);
    else await agregarEntrada(entrada);
    showToast('success', inicial ? 'Cambios guardados.' : 'Entrada añadida a tu bóveda.');
    setCargando(false);
    onClose();
  };

  const cambiarTipo = (nuevo: 'password' | 'document' | 'note') => {
    setTipo(nuevo);
    setAttachment(undefined);
    setFileName(undefined);
    setFileType(undefined);
  };

  const btnTipo = (valor: 'password' | 'document' | 'note', etiqueta: string, Icono: typeof KeyRound) => (
    <button
      type="button"
      onClick={() => cambiarTipo(valor)}
      className={`h-11 w-full rounded-button px-2 text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
        tipo === valor
          ? 'bg-blue-600 text-white'
          : 'border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'
      }`}
      aria-pressed={tipo === valor}
    >
      <Icono className="h-4 w-4 shrink-0" />
      <span className="truncate">{etiqueta}</span>
    </button>
  );

  return (
    <Modal titulo={inicial ? 'Editar entrada' : 'Nueva entrada'} onClose={onClose}>
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" role="group" aria-label="Tipo de entrada">
          {btnTipo('password', 'Contraseña', KeyRound)}
          {btnTipo('note', 'Nota segura', FileText)}
          {btnTipo('document', 'Documento', File)}
        </div>

        <div>
          <label htmlFor="nombre" className="mb-2 block text-sm font-medium">Nombre *</label>
          <input
            id="nombre"
            className="input-field"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder={
              tipo === 'password'
                ? 'Por ejemplo: Gmail'
                : tipo === 'note'
                  ? 'Por ejemplo: Códigos de recuperación'
                  : 'Por ejemplo: DNI'
            }
            autoFocus
            required
          />
        </div>

        {tipo === 'password' && (
          <>
            <div>
              <label htmlFor="usuario" className="mb-2 block text-sm font-medium">Usuario o correo</label>
              <input id="usuario" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="tu@correo.com" />
            </div>
            <div>
              <label htmlFor="contrasena" className="mb-2 block text-sm font-medium">Contraseña *</label>
              <div className="relative">
                <input
                  id="contrasena"
                  type={verClave ? 'text' : 'password'}
                  className="input-field pr-14"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setVerClave(!verClave)}
                  className="btn-ghost absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
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

        {tipo === 'note' && (
          <>
            <div>
              <label htmlFor="contenido" className="mb-2 block text-sm font-medium">Contenido de la nota *</label>
              <textarea
                id="contenido"
                className="input-field min-h-[140px] resize-y font-mono text-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe aquí el contenido cifrado de tu nota. Por ejemplo: códigos de recuperación, datos sensibles, información personal…"
                required
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Se cifra con tu clave maestra. Solo tú puedes leerlo.
              </p>
            </div>
            <div>
              <label htmlFor="usuario-nota" className="mb-2 block text-sm font-medium">Asociado a (opcional)</label>
              <input
                id="usuario-nota"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Por ejemplo: cuenta bancaria, DNI…"
              />
            </div>
          </>
        )}

        {tipo === 'document' && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Origen del documento</p>
            <div className="grid grid-cols-2 gap-2">
              <label className="btn-secondary flex cursor-pointer items-center justify-center gap-1.5">
                <File className="h-4 w-4" />
                Elegir archivo
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={desdeArchivo}
                  className="hidden"
                />
              </label>
              <label className="btn-secondary flex cursor-pointer items-center justify-center gap-1.5">
                <Camera className="h-4 w-4" />
                Tomar foto
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={desdeCamara}
                  className="hidden"
                />
              </label>
            </div>
            {fileName && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seleccionado: <span className="font-medium">{fileName}</span>
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Las fotos se comprimen automáticamente. Máx. 3 MB tras comprimir. Para archivos más grandes, guarda una nota con el enlace.
            </p>
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