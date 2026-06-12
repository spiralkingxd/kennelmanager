import { Download, Search } from 'lucide-react';
import { PERIOD_OPTIONS, ACTION_OPTIONS } from './auditConstants';

interface AuditFiltersProps {
  searchTerm: string;
  periodFilter: string;
  actionFilter: string;
  onSearchChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onDownloadCSV: () => void;
}

export function AuditFilters({
  searchTerm,
  periodFilter,
  actionFilter,
  onSearchChange,
  onPeriodChange,
  onActionChange,
  onDownloadCSV,
}: AuditFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex-1 w-full flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs min-w-[160px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Buscar por módulo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <select
          value={periodFilter}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none w-40"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => onActionChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-400 outline-none w-36"
        >
          <option value="all">Todas ações</option>
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onDownloadCSV}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors w-full sm:w-auto overflow-hidden"
      >
        <Download size={16} /> Baixar CSV
      </button>
    </div>
  );
}
