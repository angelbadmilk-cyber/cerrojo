import { useEffect, useMemo, useState } from 'react';
import { History, KeyRound, Repeat, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { PasswordEntry } from '../types';
import { useVault } from '../contexts/VaultContext';
import { verificarMultiples } from '../services/breachService';

interface Problema {
  entrada: PasswordEntry;
  razones: string[];
}

export default function SecurityReport() {
  const { entradas } = useVault();
  const [comprometidas, setComprometidas] = useState<Set<string>>(new Set());
  const [verificando, setVerificando] = useState(false);

  const auditoria = useMemo(() => {
    const contraseñas = entradas.filter((e) => e.type === 'password' && e.password);
    const total = contraseñas.length;

    const debiles = contraseñas.filter((e) => e.password.length < 10);

    const conteo = new Map<string, number>();
    contraseñas.forEach((e) => conteo.set(e.password, (conteo.get(e.password) ?? 0) + 1));
    const reutilizadas = contraseñas.filter((e) => (conteo.get(e.password) ?? 0) > 1);

    const limite90dias = Date.now() - 90 * 86400000;
    const antiguas = contraseñas.filter((e) => new Date(e.updatedAt).getTime() < limite90dias);

    const comprometidasArr = contraseñas.filter((e) => comprometidas.has(e.password));

    const score =
      total === 0
        ? 100
        : Math.max(
            0,
            Math.round(
              100 *
                (1 -
                  Math.min(
                    1,
                    (debiles.length * 0.4 + reutilizadas.length * 0.35 + antiguas.length * 0.25 + comprometidasArr.length * 0.5) / total,
                  )),
            ),
          );

    const problemas: Problema[] = contraseñas
      .map((entrada) => {
        const razones: string[] = [];
        if (entrada.password.length < 10) razones.push('Débil');
        if ((conteo.get(entrada.password) ?? 0) > 1) razones.push('Reutilizada');
        if (new Date(entrada.updatedAt).getTime() < limite90dias) razones.push('Antigua');
        if (comprometidas.has(entrada.password)) razones.push('Comprometida');
        return { entrada, razones };
      })
      .filter((p) => p.razones.length > 0);

    return { total, debiles: debiles.length, reutilizadas: reutilizadas.length, antiguas: antiguas.length, comprometidas: comprometidasArr.length, score, problemas };
  }, [entradas, comprometidas]);

  const verificarBreaches = async () => {
    setVerificando(true);
    const contraseñas = entradas
      .filter((e) => e.type === 'password' && e.password)
      .map((e) => e.password);
    
    const resultados = await verificarMultiples([...new Set(contraseñas)]);
    const comprometidasSet = new Set<string>();
    resultados.forEach((esComprometida, password) => {
      if (esComprometida) comprometidasSet.add(password);
    });
    setComprometidas(comprometidasSet);
    setVerificando(false);
  };

  useEffect(() => {
    // Verificar automáticamente al montar el componente
    verificarBreaches();
  }, [entradas]);

  const R = 52;
  const C = 2 * Math.PI * R;
  const colorAnillo =
    auditoria.score >= 80 ? 'stroke-emerald-500' : auditoria.score >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Auditoría de seguridad</h1>

      {auditoria.total === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Nada que auditar todavía</h2>
          <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
            Cuando añadas contraseñas a tu bóveda, aquí verás su nivel de seguridad.
          </p>
        </div>
      ) : (
        <>
          <section className="card flex flex-col items-center gap-6 p-6 sm:flex-row">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90" aria-hidden="true">
                <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700" />
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - auditoria.score / 100)}
                  className={colorAnillo}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-slate-900 dark:text-white">
                {auditoria.score}%
              </span>
            </div>
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Salud de tus contraseñas</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Analizamos {auditoria.total} contraseñas en busca de claves débiles, reutilizadas, antiguas o comprometidas en filtraciones.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <KeyRound className="h-4 w-4" />
                <span className="text-sm font-medium">Débiles</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{auditoria.debiles}</p>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                <Repeat className="h-4 w-4" />
                <span className="text-sm font-medium">Reutilizadas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{auditoria.reutilizadas}</p>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <History className="h-4 w-4" />
                <span className="text-sm font-medium">Antiguas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{auditoria.antiguas}</p>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Comprometidas</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{auditoria.comprometidas}</p>
            </div>
          </section>

          {auditoria.problemas.length > 0 && (
            <section className="card divide-y divide-slate-200 dark:divide-slate-800">
              <div className="flex items-center gap-2 p-5">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Entradas que deberías revisar</h2>
              </div>
              {auditoria.problemas.map(({ entrada, razones }) => (
                <div key={entrada.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{entrada.siteName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{entrada.username}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {razones.map((r) => (
                      <span
                        key={r}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r === 'Débil'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            : r === 'Reutilizada'
                              ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                              : r === 'Comprometida'
                                ? 'bg-red-600/20 text-red-800 dark:text-red-200'
                                : 'bg-slate-500/10 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}