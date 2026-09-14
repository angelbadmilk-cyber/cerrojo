import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

const REGLAS = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /vaults/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

const ENV = `VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`;

export default function CloudSetup() {
  const [copiado, setCopiado] = useState<'reglas' | 'env' | null>(null);

  const copiar = async (texto: string, tipo: 'reglas' | 'env') => {
    await navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    window.setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Sincronización en la nube</h1>

      <div className="card space-y-5 p-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Cerrojo funciona 100% sin internet. Si quieres sincronizar entre dispositivos, conecta tu
          propia cuenta gratuita de Firebase. Tu bóveda viaja y se guarda siempre cifrada: el servidor
          solo ve datos ilegibles.
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>
            Crea un proyecto gratis en{' '}
            <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline dark:text-blue-400">
              console.firebase.google.com
            </a>
            .
          </li>
          <li>
            En el menú lateral → <strong>Build</strong> → <strong>Authentication</strong> →{' '}
            <em>Comenzar</em> → activa el proveedor <strong>Correo electrónico/contraseña</strong>.
          </li>
          <li>
            En el menú lateral → <strong>Build</strong> → <strong>Firestore Database</strong> →{' '}
            <em>Crear base de datos</em> en <strong>modo de producción</strong>.
          </li>
          <li>
            En la pestaña <strong>Reglas</strong> de Firestore, borra todo y pega el código de abajo.
            Pulsa <em>Publicar</em>.
          </li>
          <li>
            En el panel general, pulsa el icono <code>{'</>'}</code> (Web) para registrar una app web y
            copia el bloque <code>firebaseConfig</code>.
          </li>
          <li>
            Crea el archivo <code>.env</code> en la raíz de tu proyecto con esos valores y reinicia{' '}
            <code>npm run dev</code>.
          </li>
        </ol>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
            Reglas de Firestore (pega en Firestore → Reglas → Publicar):
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-input bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
              {REGLAS}
            </pre>
            <button
              type="button"
              onClick={() => void copiar(REGLAS, 'reglas')}
              className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-button bg-slate-700 text-slate-200 transition-colors hover:bg-slate-600"
              aria-label="Copiar reglas de Firestore"
            >
              {copiado === 'reglas' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-900 dark:text-white">
            Contenido del archivo .env (sustituye los <code>...</code> por tus valores):
          </p>
          <pre className="overflow-x-auto rounded-input bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
            {ENV}
          </pre>
        </div>
      </div>
    </div>
  );
}