import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import { ToastProvider } from './contexts/ToastContext';
import { VaultProvider, useVault } from './contexts/VaultContext';
import { useTheme } from './hooks/useTheme';

function Contenido() {
  const { estado, bloquear } = useVault();
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cerrojo_onboarded')) {
      setMostrarOnboarding(true);
    }
  }, []);

  const completarOnboarding = () => {
    localStorage.setItem('cerrojo_onboarded', 'true');
    setMostrarOnboarding(false);
  };

  if (mostrarOnboarding) {
    return <Onboarding onComplete={completarOnboarding} />;
  }

  if (estado === 'cargando') {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Cargando Cerrojo">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (estado === 'desbloqueado') {
    return <Layout onLogout={bloquear} />;
  }

  return <AuthScreen />;
}

export default function App() {
  useTheme();

  return (
    <ToastProvider>
      <VaultProvider>
        <Contenido />
      </VaultProvider>
    </ToastProvider>
  );
}