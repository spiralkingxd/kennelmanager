import { Search } from 'lucide-react';

interface WaitlistSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function WaitlistSearchFilter({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }: WaitlistSearchFilterProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar cliente, raça ou preferência..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
        className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Todos os status</option>
        <option value="ACTIVE">Ativo</option>
        <option value="MATCHED">Match</option>
        <option value="COMPLETED">Concluído</option>
        <option value="EXPIRED">Expirado</option>
        <option value="CANCELED">Cancelado</option>
      </select>
    </div>
  );
}
