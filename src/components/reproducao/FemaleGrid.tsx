import { Fragment } from 'react';
import { Heart, Dog } from 'lucide-react';
import type { FemaleReproData } from './types';
import { FemaleCard } from './FemaleCard';

// ─── FemaleGrid ───────────────────────────────────────────────────────────────

interface FemaleGridProps {
  filteredFemales: FemaleReproData[];
  onRegistros?: (animal: FemaleReproData['animal']) => void;
}

export function FemaleGrid({ filteredFemales, onRegistros }: FemaleGridProps) {
  return (
    <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Heart size={18} className="text-pink-500" />
          Matrizes ({filteredFemales.length})
        </h3>
      </div>

      {filteredFemales.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] py-12 text-center">
          <Dog size={40} className="text-zinc-600 mb-3" />
          <p className="text-sm font-medium text-zinc-400">Nenhuma fêmea encontrada</p>
          <p className="text-xs text-zinc-600 mt-1">Adicione fêmeas ao plantel para acompanhar o ciclo reprodutivo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFemales.map((femea) => (
            <Fragment key={femea.animal.id}>
              <FemaleCard femea={femea} onRegistros={onRegistros} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
