import { Search, Plus, Dog, Calendar, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../shared/utils/apiFetch';

interface PlantelListProps {
  onSelectDog: (id: string) => void;
  onNewAnimal?: () => void;
  onDeleteDog?: (id: string, name: string) => void;
  refreshKey?: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/50' },
  INACTIVE: { label: 'Inativo', color: 'bg-amber-500/10 text-amber-500 border border-amber-800/50' },
  DECEASED: { label: 'Falecido', color: 'bg-red-500/10 text-red-400 border border-red-800/50' },
  SOLD: { label: 'Vendido', color: 'bg-blue-500/10 text-blue-400 border border-blue-800/50' },
};

function computeAge(birthDate: string | null): string {
  if (!birthDate) return 'N/I';
  const birth = new Date(birthDate);
  const today = new Date();
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  if (months < 0) return `${years - 1}a ${12 + months}m`;
  return `${years}a ${months}m`;
}

const ITEMS_PER_PAGE = 20;

export function PlantelList({ onSelectDog, onNewAnimal, onDeleteDog, refreshKey }: PlantelListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchDogs = (search: string | undefined, pageNum: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(pageNum));
    params.set('limit', String(ITEMS_PER_PAGE));

    apiFetch(`/animals?${params}`)
      .then(res => {
        if (res.success) {
          setDogs(res.data);
          setTotal(res.meta?.total ?? 0);
          setTotalPages(res.meta?.totalPages ?? 1);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Resetar p/ página 1 quando a busca muda
  useEffect(() => { setPage(1); }, [searchTerm]);

  // Fetch imediato no mount / quando busca é limpa
  // Fetch debounced (300ms) quando usuário está digitando
  useEffect(() => {
    if (!searchTerm) {
      fetchDogs(undefined, page);
    } else {
      const timer = setTimeout(() => fetchDogs(searchTerm, page), 300);
      return () => clearTimeout(timer);
    }
  }, [page, searchTerm, refreshKey]);
  
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative flex-1 group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, registro ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-10 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onNewAnimal?.()}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
        >
          <Plus size={18} />
          Cadastrar Novo Animal
        </button>
      </div>

      {/* Loading inicial (plantel vazio) — spinner simples, sem skeleton que "some" */}
      {loading && dogs.length === 0 && !searchTerm && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Loading com busca ativa — skeletons (resultados esperados) */}
      {loading && dogs.length === 0 && searchTerm && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 animate-pulse">
              <div className="p-5 flex gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-800" />
                <div className="flex flex-col justify-center flex-1 gap-2">
                  <div className="h-4 w-3/4 rounded bg-zinc-800" />
                  <div className="h-3 w-1/2 rounded bg-zinc-800/80" />
                  <div className="flex gap-2 mt-1">
                    <div className="h-3 w-16 rounded bg-zinc-800/60" />
                    <div className="h-3 w-12 rounded bg-zinc-800/60" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-800/50 px-5 py-3">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-5 w-14 rounded-md bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state — centralizado verticalmente na página */}
      {!loading && dogs.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] text-center text-zinc-500">
          <Dog size={48} className="mx-auto mb-4 text-zinc-700" />
          <p className="text-lg font-semibold mb-1">Nenhum animal encontrado</p>
          <p className="text-sm">{searchTerm ? 'Tente outro termo de busca' : 'Cadastre seu primeiro animal no plantel'}</p>
        </div>
      )}

      {/* Grid de Animais — também visível durante troca de página (dogs antigo mantido) */}
      {dogs.length > 0 && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dogs.map(dog => {
          const statusStyle = STATUS_MAP[dog.status] || STATUS_MAP.ACTIVE;
          return (
            <div 
              key={dog.id} 
              onClick={() => onSelectDog(dog.id)}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-all hover:border-zinc-700 hover:bg-zinc-800/60 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="p-5 flex gap-4">
                <div className="flex h-16 w-16 shrink-0 shadow-inner items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-xl font-bold text-zinc-500 transition-transform group-hover:scale-105">
                  {dog.name?.charAt(0) || '?'}
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <h3 className="truncate font-bold text-zinc-100">{dog.name}</h3>
                  <p className="truncate text-xs font-medium text-zinc-400">{dog.breed}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar size={12} />
                    <span>{computeAge(dog.birth_date)}</span>
                    <span className="text-zinc-700">•</span>
                    <span>{dog.sex === 'MALE' ? 'Macho' : 'Fêmea'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-zinc-800/50 bg-zinc-900/50 px-5 py-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold uppercase text-zinc-500">Registro</span>
                  <span className="text-xs font-medium text-zinc-300">{dog.registration_number || dog.pedigree_number || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {onDeleteDog && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteDog(dog.id, dog.name); }}
                      aria-label={`Excluir ${dog.name}`}
                      className="rounded-lg p-1.5 text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <span className={`rounded px-2 text-[10px] font-bold uppercase tracking-wider py-1 ${statusStyle.color}`}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Paginação — exibida apenas quando >1 página */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-sm text-zinc-500">
            Página {page} de {totalPages} ({total} registros)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-9 items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-9 items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-900/50 px-4 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próximo
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
