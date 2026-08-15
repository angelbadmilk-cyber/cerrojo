import { useState } from 'react';
import Logo from './Logo';
import RecoveryForm from './RecoveryForm';
import ResetForm from './ResetForm';
import SetupForm from './SetupForm';
import UnlockForm from './UnlockForm';
import { useVault } from '../contexts/VaultContext';

export default function AuthScreen() {
  const { estado } = useVault();
  const [enRecuperacion, setEnRecuperacion] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="card animate-fade-in p-8">
          {estado === 'configuracion' && <SetupForm />}

          {estado === 'bloqueado' &&
            (enRecuperacion ? (
              <RecoveryForm onVolver={() => setEnRecuperacion(false)} />
            ) : (
              <UnlockForm onOlvido={() => setEnRecuperacion(true)} />
            ))}

          {estado === 'restablecer' && <ResetForm />}
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Cifrado local Zero-Knowledge. Sin tu clave, nadie puede leer tus datos.
        </p>
      </div>
    </div>
  );
}