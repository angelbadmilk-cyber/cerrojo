import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmationDialogProps {
  titulo: string;
  mensaje: string;
  textoBoton: string;
  onConfirmar: () => void;
  onClose: () => void;
}

export default function ConfirmationDialog({
  titulo,
  mensaje,
  textoBoton,
  onConfirmar,
  onClose,
}: ConfirmationDialogProps) {
  return (
    <Modal titulo={titulo} onClose={onClose} anchoMax="max-w-md">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{mensaje}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center rounded-button bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          onClick={() => {
            onConfirmar();
            onClose();
          }}
        >
          {textoBoton}
        </button>
      </div>
    </Modal>
  );
}