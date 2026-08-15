interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  let puntos = 0;
  if (password.length >= 8) puntos += 1;
  if (password.length >= 12) puntos += 1;
  if (/[A-ZÁÉÍÓÚÑ]/.test(password)) puntos += 1;
  if (/\d/.test(password)) puntos += 1;
  if (/[^A-Za-z0-9]/.test(password)) puntos += 1;

  const nivel = Math.max(1, puntos);
  const etiquetas = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];
  const colores = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-500',
  ];

  return (
    <div className="mt-3">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((indice) => (
          <span
            key={indice}
            className={`h-1 flex-1 rounded-full transition-colors ${
              indice < nivel ? colores[nivel - 1] : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
        Fortaleza: {etiquetas[nivel - 1]}
      </p>
    </div>
  );
}