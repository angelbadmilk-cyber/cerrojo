import { useState } from 'react';
import { Dices, Wand2 } from 'lucide-react';
import { generarPassword } from '../services/cryptoService';

interface PasswordGeneratorProps {
  onUsar: (clave: string) => void;
}

export default function PasswordGenerator({ onUsar }: PasswordGeneratorProps) {
  const [longitud, setLongitud] = useState(16);
  const [mayusculas, setMayusculas] = useState(true);
  const [numeros, setNumeros] = useState(true);
  const [simbolos, setSimbolos] = useState(true);
  const [generada, setGenerada] = useState('');

  const generar = () => {
    setGenerada(generarPassword({ longitud, mayusculas, numeros, simbolos }));
  };

  return (
    <div className="space-y-3 rounded-input border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Generador de contraseñas</p>
        <button type="button" onClick={generar} className="btn-secondary">
          <Dices className="h-4 w-4" />
          Generar
        </button>
      </div>

      <div>
        <label htmlFor="longitud" className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
          Longitud: <strong>{longitud}</strong>
        </label>
        <input
          id="longitud"
          type="range"
          min={8}
          max={64}
          value={longitud}
          onChange={(e) => setLongitud(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-button border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
          <input
            type="checkbox"
            checked={mayusculas}
            onChange={(e) => setMayusculas(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Mayúsculas
        </label>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-button border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
          <input
            type="checkbox"
            checked={numeros}
            onChange={(e) => setNumeros(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Números
        </label>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-button border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800">
          <input
            type="checkbox"
            checked={simbolos}
            onChange={(e) => setSimbolos(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Símbolos
        </label>
      </div>

      {generada && (
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-input bg-white px-3 py-2 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
            {generada}
          </code>
          <button type="button" onClick={() => onUsar(generada)} className="btn-primary">
            <Wand2 className="h-4 w-4" />
            Usar
          </button>
        </div>
      )}
    </div>
  );
}