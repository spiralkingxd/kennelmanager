// ─── SearchDropdown ──────────────────────────────────────────────────────────

interface SearchDropdownProps {
  results: { id: string; name: string }[];
  show: boolean;
  loading: boolean;
  onSelect: (id: string, name: string) => void;
}

export function SearchDropdown({ results, show, loading, onSelect }: SearchDropdownProps) {
  if (!show) return null;
  return (
    <div className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden">
      {loading ? (
        <div className="px-4 py-3 text-sm text-zinc-400 flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          Buscando...
        </div>
      ) : results.length === 0 ? null : (
        results.map(item => (
          <button
            key={item.id}
            type="button"
            onMouseDown={() => onSelect(item.id, item.name)}
            className="w-full text-left px-4 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors font-semibold border-b border-zinc-800 last:border-b-0"
          >
            {item.name}
          </button>
        ))
      )}
    </div>
  );
}
