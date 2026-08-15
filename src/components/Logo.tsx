import { LockKeyhole } from 'lucide-react';

interface LogoProps {
  compacto?: boolean;
}

export default function Logo({ compacto = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-600 text-white">
        <LockKeyhole className="h-5 w-5" />
      </div>
      {!compacto && (
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          Cerrojo
        </span>
      )}
    </div>
  );
}