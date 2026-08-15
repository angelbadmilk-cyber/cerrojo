import { useEffect, useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { Secret, TOTP } from 'otpauth';
import { useToast } from '../contexts/ToastContext';
import { copiarAlPortapapeles } from '../services/uiService';

interface TOTPDisplayProps {
  secret: string;
}

const RADIO = 10;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

export default function TOTPDisplay({ secret }: TOTPDisplayProps) {
  const { showToast } = useToast();
  const [ahora, setAhora] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const intervalo = window.setInterval(
      () => setAhora(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => window.clearInterval(intervalo);
  }, []);

  const totp = useMemo(() => {
    try {
      return new TOTP({
        secret: Secret.fromBase32(secret.replace(/\s+/g, '').toUpperCase()),
        digits: 6,
        period: 30,
        algorithm: 'sha1',
      });
    } catch {
      return null;
    }
  }, [secret]);

  const periodo = ahora - (ahora % 30);

  const codigo = useMemo(() => {
    try {
      return totp ? totp.generate() : null;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totp, periodo]);

  if (!totp || !codigo) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        Secreto 2FA no válido. Edita la entrada para corregirlo.
      </p>
    );
  }

  const restantes = 30 - (ahora % 30);
  const progreso = restantes / 30;

  const copiar = async () => {
    await copiarAlPortapapeles(codigo);
    showToast('success', 'Código 2FA copiado. El portapapeles se limpiará en 30 s.');
  };

  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 rounded-input bg-slate-100 px-3 py-2 text-lg font-semibold tracking-widest text-slate-900 dark:bg-slate-800 dark:text-white">
        {codigo.slice(0, 3)} {codigo.slice(3)}
      </code>
      <button type="button" onClick={() => void copiar()} className="btn-ghost" aria-label="Copiar código 2FA">
        <Copy className="h-4 w-4" />
      </button>
      <div className="relative flex items-center justify-center" aria-label={`El código cambia en ${restantes} segundos`}>
        <svg width="36" height="36" viewBox="0 0 24 24" className="-rotate-90" aria-hidden="true">
          <circle cx="12" cy="12" r={RADIO} fill="none" strokeWidth="2.5" className="stroke-slate-200 dark:stroke-slate-700" />
          <circle
            cx="12"
            cy="12"
            r={RADIO}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={CIRCUNFERENCIA}
            strokeDashoffset={CIRCUNFERENCIA * (1 - progreso)}
            className={restantes <= 5 ? 'stroke-red-500' : 'stroke-blue-600'}
          />
        </svg>
        <span className={`absolute text-xs font-semibold ${restantes <= 5 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
          {restantes}
        </span>
      </div>
    </div>
  );
}