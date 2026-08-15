import { useState } from 'react';
import { ArrowLeft, ArrowRight, Cloud, Lock, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: () => void;
}

const pasos = [
  {
    icono: ShieldCheck,
    titulo: 'Privacidad total',
    descripcion:
      'Tus contraseñas se cifran en tu dispositivo con tu clave maestra. Nadie más puede leerlas.',
  },
  {
    icono: Lock,
    titulo: 'Seguridad de nivel bancario',
    descripcion:
      'Cifrado AES-256-GCM y derivación de clave Argon2id, los mismos estándares que usa la banca en línea.',
  },
  {
    icono: Cloud,
    titulo: 'Tu nube, opcional',
    descripcion:
      'Funciona 100% sin internet. Si quieres, activa la sincronización cifrada para usarla en varios dispositivos.',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [paso, setPaso] = useState(0);
  const esUltimo = paso === pasos.length - 1;
  const { icono: Icono, titulo, descripcion } = pasos[paso];

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card animate-fade-in p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Icono className="h-8 w-8" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              {titulo}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {descripcion}
            </p>
          </div>

          <div className="mb-8 flex justify-center gap-2">
            {pasos.map((_, indice) => (
              <span
                key={indice}
                className={`h-2 rounded-full transition-all ${
                  indice === paso
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {paso > 0 && (
              <button
                type="button"
                onClick={() => setPaso(paso - 1)}
                className="btn-secondary flex-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={() => (esUltimo ? onComplete() : setPaso(paso + 1))}
              className="btn-primary flex-1"
            >
              {esUltimo ? 'Comenzar' : 'Siguiente'}
              {!esUltimo && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="text-sm text-slate-500 underline-offset-4 hover:underline dark:text-slate-400"
          >
            Saltar introducción
          </button>
        </div>
      </div>
    </div>
  );
}