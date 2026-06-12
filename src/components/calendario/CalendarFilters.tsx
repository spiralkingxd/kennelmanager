import { Filter } from 'lucide-react';
import type { EventCategory } from './types';
import { CATEGORY_LABELS, CATEGORY_STYLES, ALL_CATEGORIES } from './constants';

// ─── CalendarFilters ─────────────────────────────────────────────────────────

interface CalendarFiltersProps {
  activeFilters: Record<string, boolean>;
  onToggleFilter: (cat: string) => void;
  onSetAllFilters: (val: boolean) => void;
}

export function CalendarFilters({ activeFilters, onToggleFilter, onSetAllFilters }: CalendarFiltersProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 mb-6 flex flex-wrap items-center gap-3">
      <span className="text-sm font-bold text-zinc-300 flex items-center gap-2">
        <Filter size={16} className="text-zinc-400" /> Filtros:
      </span>
      {ALL_CATEGORIES.map(key => {
        const style = CATEGORY_STYLES[key];
        return (
          <button 
            key={key} 
            onClick={() => onToggleFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              activeFilters[key] 
                ? `${style.bg} ${style.border} ${style.color}`
                : 'bg-zinc-800/50 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400'
            }`}
          >
            <style.icon size={12} />
            {CATEGORY_LABELS[key]}
          </button>
        );
      })}
      <div className="ml-auto flex gap-2">
         <button onClick={() => onSetAllFilters(true)} className="text-xs text-brand-500 hover:text-brand-400 font-semibold underline decoration-brand-500/30 underline-offset-2">Selecionar Todos</button>
         <span className="text-zinc-700">|</span>
         <button onClick={() => onSetAllFilters(false)} className="text-xs text-zinc-500 hover:text-zinc-300 font-semibold underline decoration-zinc-500/30 underline-offset-2">Ocultar Todos</button>
      </div>
    </div>
  );
}
