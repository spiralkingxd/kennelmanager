import { Search } from 'lucide-react';

interface CustosListHeaderProps {
  animalCount: number;
  sortBy: 'cost' | 'name';
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: 'cost' | 'name') => void;
}

export function CustosListHeader({ animalCount, sortBy, searchTerm, onSearchChange, onSortChange }: CustosListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Custos por Animal</h2>
        <p className="text-sm text-zinc-500">{animalCount} animais com registros financeiros</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" placeholder="Buscar animal..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-48 rounded-xl border border-zinc-700 bg-zinc-900/50 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" />
        </div>
        <button onClick={() => onSortChange('cost')}
          className={`h-9 rounded-lg px-3 text-xs font-bold transition-colors ${sortBy === 'cost' ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'}`}>
          Maiores Custos
        </button>
        <button onClick={() => onSortChange('name')}
          className={`h-9 rounded-lg px-3 text-xs font-bold transition-colors ${sortBy === 'name' ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'}`}>
          A-Z
        </button>
      </div>
    </div>
  );
}
