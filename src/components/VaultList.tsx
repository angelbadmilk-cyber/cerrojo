import { useEffect, useMemo, useState } from 'react';
import type { Category, PasswordEntry, ViewMode } from '../types';
import { useVault } from '../contexts/VaultContext';
import { guardarAjustes, obtenerAjustes } from '../services/dbService';
import { normalizarTexto } from '../services/uiService';
import EmptyState from './EmptyState';
import VaultCard from './VaultCard';
import VaultFilters from './VaultFilters';
import VaultHeader from './VaultHeader';

interface VaultListProps {
  consulta: string;
  onOpen: (entrada: PasswordEntry) => void;
  onAdd: () => void;
}

export default function VaultList({ consulta, onOpen, onAdd }: VaultListProps) {
  const { entradas } = useVault();
  const [vista, setVista] = useState<ViewMode>('list');
  const [favicons, setFavicons] = useState(false);
  const [categoria, setCategoria] = useState<Category | 'todas'>('todas');
  const [etiqueta, setEtiqueta] = useState('');

  useEffect(() => {
    const cargar = () => {
      obtenerAjustes().then((a) => {
        setVista(a.viewMode);
        setFavicons(a.faviconsEnabled);
      });
    };
    cargar();
    window.addEventListener('cerrojo:ajustes', cargar);
    return () => window.removeEventListener('cerrojo:ajustes', cargar);
  }, []);

  const cambiarVista = (nueva: ViewMode) => {
    setVista(nueva);
    obtenerAjustes().then((a) => guardarAjustes({ ...a, viewMode: nueva }));
  };

  const etiquetas = useMemo(
    () => Array.from(new Set(entradas.flatMap((e) => e.tags))).sort(),
    [entradas],
  );

  const filtradas = useMemo(() => {
    const q = normalizarTexto(consulta);
    return entradas
      .filter((e) => (categoria === 'todas' ? true : e.category === categoria))
      .filter((e) => (etiqueta ? e.tags.includes(etiqueta) : true))
      .filter((e) => {
        if (!q) return true;
        const campos = [
          e.siteName,
          e.username,
          e.url ?? '',
          e.tags.join(' '),
          e.content ?? '', // Buscar en contenido de notas
          e.fileName ?? '', // Buscar en nombres de documentos
        ];
        return campos.some((campo) => normalizarTexto(campo).includes(q));
      })
      .sort(
        (a, b) =>
          Number(b.favorite ?? false) - Number(a.favorite ?? false) ||
          b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [entradas, consulta, categoria, etiqueta]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <VaultHeader total={filtradas.length} vista={vista} onCambiarVista={cambiarVista} onAdd={onAdd} />

      {entradas.length === 0 ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <>
          <VaultFilters
            categoria={categoria}
            onCategoria={setCategoria}
            etiquetas={etiquetas}
            etiqueta={etiqueta}
            onEtiqueta={setEtiqueta}
          />

          {filtradas.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
              Sin resultados para la búsqueda o los filtros actuales.
            </p>
          ) : vista === 'list' ? (
            <div className="space-y-2">
              {filtradas.map((entrada) => (
                <VaultCard key={entrada.id} entrada={entrada} vista="list" conFavicons={favicons} onOpen={() => onOpen(entrada)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtradas.map((entrada) => (
                <VaultCard key={entrada.id} entrada={entrada} vista="grid" conFavicons={favicons} onOpen={() => onOpen(entrada)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}