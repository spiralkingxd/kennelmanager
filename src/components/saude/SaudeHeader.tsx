import { Search, Filter, Plus } from 'lucide-react';

interface SaudeHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewRecord: () => void;
}

export function SaudeHeader({ searchTerm, onSearchChange, onNewRecord }: SaudeHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative flex-1 group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar animal, vacina ou medicamento..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
          <Filter size={18} />
        </button>
      </div>

      <button
        onClick={onNewRecord}
        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
      >
        <Plus size={18} />
        Novo Registro de Saúde
      </button>
    </div>
  );
}