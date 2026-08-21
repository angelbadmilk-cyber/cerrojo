import { useState } from 'react';
import { Lock, Menu, Plus, Search } from 'lucide-react';
import type { PasswordEntry, Seccion } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useVault } from '../contexts/VaultContext';
import { useAutoLock } from '../hooks/useAutoLock';
import { useHotkeys } from '../hooks/useHotkeys';
import BottomNav from './BottomNav';
import CloudPanel from './CloudPanel';
import CommandPalette from './CommandPalette';
import ConfirmationDialog from './ConfirmationDialog';
import EntryDrawer from './EntryDrawer';
import OnlineStatusBadge from './OnlineStatusBadge';
import PasswordForm from './PasswordForm';
import PrivacyScreen from './PrivacyScreen';
import SecurityReport from './SecurityReport';
import SettingsPanel from './SettingsPanel';
import Sidebar from './Sidebar';
import VaultList from './VaultList';

interface LayoutProps {
  onLogout: () => void;
}

export default function Layout({ onLogout }: LayoutProps) {
  const { entradas, actualizarEntrada, eliminarEntrada } = useVault();
  const { showToast } = useToast();
  const [seccion, setSeccion] = useState<Seccion>('boveda');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [paletaAbierta, setPaletaAbierta] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [idSeleccionada, setIdSeleccionada] = useState<string | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [aEditar, setAEditar] = useState<PasswordEntry | null>(null);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  useHotkeys(() => setPaletaAbierta(true));
  useAutoLock(onLogout);

  const seleccionada = entradas.find((e) => e.id === idSeleccionada) ?? null;

  const abrirNueva = () => {
    setAEditar(null);
    setFormAbierto(true);
  };

  const alternarFavorita = async () => {
    if (!seleccionada) return;
    await actualizarEntrada({ ...seleccionada, favorite: !seleccionada.favorite });
    showToast('success', seleccionada.favorite ? 'Eliminada de favoritas.' : 'Añadida a favoritas.');
  };

  const borrar = async () => {
    if (!seleccionada) return;
    await eliminarEntrada(seleccionada.id);
    setIdSeleccionada(null);
    showToast('success', 'Entrada eliminada de tu bóveda.');
  };

  return (
    <div className="min-h-screen">
      <Sidebar
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onLogout={onLogout}
        seccion={seccion}
        onNavegar={setSeccion}
      />

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <button type="button" onClick={() => setMenuAbierto(true)} className="btn-ghost lg:hidden" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setPaletaAbierta(true)}
              className="flex h-11 max-w-xl flex-1 items-center gap-3 rounded-input border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              <Search className="h-4 w-4" />
              <span className="truncate">Buscar en Cerrojo </span>
              <kbd className="ml-auto hidden rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-500 sm:block dark:border-slate-600 dark:bg-slate-900">Ctrl K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <OnlineStatusBadge />
              <button type="button" onClick={onLogout} className="btn-ghost" aria-label="Bloquear bóveda" title="Bloquear">
                <Lock className="h-5 w-5" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white" aria-hidden="true">
                C
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-28 lg:px-8 lg:pb-8">
          {seccion === 'boveda' && (
            <VaultList consulta={consulta} onOpen={(entrada) => setIdSeleccionada(entrada.id)} onAdd={abrirNueva} />
          )}
          {seccion === 'auditoria' && <SecurityReport />}
          {seccion === 'nube' && <CloudPanel />}
          {seccion === 'ajustes' && <SettingsPanel />}
        </main>
      </div>

      {seccion === 'boveda' && (
        <button
          type="button"
          onClick={abrirNueva}
          className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 lg:hidden"
          aria-label="Añadir secreto"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <BottomNav seccion={seccion} onNavegar={setSeccion} />

      {paletaAbierta && (
        <CommandPalette
          consulta={consulta}
          onCambiarConsulta={setConsulta}
          onClose={() => setPaletaAbierta(false)}
          onSeleccionar={(entrada) => {
            setSeccion('boveda');
            setIdSeleccionada(entrada.id);
            setPaletaAbierta(false);
            setConsulta('');
          }}
        />
      )}

      {seleccionada && (
        <EntryDrawer
          entrada={seleccionada}
          onClose={() => setIdSeleccionada(null)}
          onEdit={() => {
            setAEditar(seleccionada);
            setFormAbierto(true);
          }}
          onDelete={() => setConfirmandoBorrado(true)}
          onToggleFavorite={() => void alternarFavorita()}
        />
      )}

      {formAbierto && (
        <PasswordForm
          inicial={aEditar}
          onClose={() => {
            setFormAbierto(false);
            setAEditar(null);
          }}
        />
      )}

      {confirmandoBorrado && seleccionada && (
        <ConfirmationDialog
          titulo="Eliminar entrada"
          mensaje={`Se eliminará «${seleccionada.siteName}» de tu bóveda. Esta acción no se puede deshacer.`}
          textoBoton="Eliminar"
          onConfirmar={() => void borrar()}
          onClose={() => setConfirmandoBorrado(false)}
        />
      )}

      <PrivacyScreen />
    </div>
  );
}