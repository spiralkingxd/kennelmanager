import React from 'react';
import { ChevronLeft, Baby, Calendar, Trash2 } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from './NinhadaProfile.constants';
import { formatDate } from './NinhadaProfile.utils';

interface NinhadaProfileHeaderProps {
  onBack: () => void;
  litter: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function NinhadaProfileHeader({ onBack, litter, onEdit, onDelete }: NinhadaProfileHeaderProps) {
  const litterName = `Ninhada de ${litter.mother_name} & ${litter.father_name}`;
  const badgeColor = STATUS_COLORS[litter.status] || STATUS_COLORS.PLANNED;

  return (
    <div className="flex items-start gap-4">
      <button
        onClick={onBack}
        className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-zinc-800 bg-zinc-800 text-brand-500">
            <Baby size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">{litterName}</h1>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
                {STATUS_LABELS[litter.status] || litter.status}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-400">
               <Calendar size={14} />
               {litter.birth_date
                 ? `Nascimento: ${formatDate(litter.birth_date)}`
                 : `Previsto: ${litter.expected_date ? formatDate(litter.expected_date) : '-'}`
               }
               <span className="text-zinc-700">•</span>
               Mãe: <span className="text-zinc-300">{litter.mother_name}</span>
               <span className="text-zinc-700">•</span>
               Pai: <span className="text-zinc-300">{litter.father_name}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} className="mr-2 inline" />
              Excluir
            </button>
            <button
              onClick={onEdit}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
             Editar Ninhada
           </button>
        </div>
      </div>
    </div>
  );
}
