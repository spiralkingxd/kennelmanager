import { Activity } from 'lucide-react';
import type { FemaleReproData } from './types';
import { getStatusColor, getStatusProgressColor } from './utils';

// ─── FemaleCard ───────────────────────────────────────────────────────────────

interface FemaleCardProps {
  femea: FemaleReproData;
  onRegistros?: (animal: FemaleReproData['animal']) => void;
}

export function FemaleCard({ femea, onRegistros }: FemaleCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-800/20 p-5 transition-colors hover:bg-zinc-800/40">

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 font-bold border border-zinc-700">
            {femea.animal.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-zinc-100">{femea.animal.name}</h4>
            <span className="text-xs text-zinc-500">{femea.animal.breed}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(femea.status)}`}>
          {femea.status}
        </span>
      </div>

      {femea.progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">Progresso ({femea.statusDays} dias)</span>
            <span className="text-zinc-300 font-medium">{femea.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${getStatusProgressColor(femea.status)}`}
              style={{ width: `${femea.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-auto grid grid-cols-2 gap-2 text-sm pt-3 border-t border-zinc-800/50">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500">Próximo Evento</span>
          <span className="font-medium text-zinc-300">{femea.nextEvent}</span>
        </div>
        <div className="flex flex-col border-l border-zinc-800 pl-3">
          <span className="text-xs text-zinc-500">Data</span>
          <span className="font-medium text-zinc-300">{femea.nextDate || '—'}</span>
        </div>
      </div>

      {onRegistros && (
        <button
          onClick={(e) => { e.stopPropagation(); onRegistros(femea.animal); }}
          className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <Activity size={14} /> Ver Registros ({femea.heatCycles.length + femea.matings.length + femea.gestations.length})
        </button>
      )}

    </div>
  );
}
