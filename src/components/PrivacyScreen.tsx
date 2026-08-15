import { useEffect, useState } from 'react';
import Logo from './Logo';

// Oculta el contenido (blur) cuando la ventana pierde el foco
export default function PrivacyScreen() {
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    const alPerderFoco = () => setOculto(true);
    const alGanarFoco = () => setOculto(false);
    const alCambiarVisibilidad = () => setOculto(document.hidden);

    window.addEventListener('blur', alPerderFoco);
    window.addEventListener('focus', alGanarFoco);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    return () => {
      window.removeEventListener('blur', alPerderFoco);
      window.removeEventListener('focus', alGanarFoco);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, []);

  if (!oculto) return null;

  return (
    <button
      type="button"
      onClick={() => setOculto(false)}
      className="fixed inset-0 z-[70] flex w-full flex-col items-center justify-center gap-6 bg-white/70 backdrop-blur-2xl dark:bg-slate-950/70"
      aria-label="Pantalla de privacidad. Haz clic para volver."
    >
      <Logo />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Contenido oculto por privacidad. Haz clic para volver.
      </p>
    </button>
  );
}