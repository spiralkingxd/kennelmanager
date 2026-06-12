import { Baby, Search, Plus, Calendar, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LitterModal } from './modals/LitterModal';
import { apiFetch } from '../../shared/utils/apiFetch';

interface NinhadasListProps {
  onSelectNinhada: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PLANNED:   { label: 'Planejada',  className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  BORN:      { label: 'Nascida',    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  WEANING:   { label: 'Desmame',    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  COMPLETED: { label: 'Concluída',  className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  CANCELED:  { label: 'Cancelada',  className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function formatDate(dateStr: string | null, expectedDate: string | null): string {
  if (dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  }
  if (expectedDate) {
    try {
      return `Previsto: ${new Date(expectedDate).toLocaleDateString('pt-BR')}`;
    } catch {
      return `Previsto: ${expectedDate}`;
    }
  }
  return '—';
}

export function NinhadasList({ onSelectNinhada }: NinhadasListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ninhadas, setNinhadas] = useState<any[]>([]);
  const [litterModalOpen, setLitterModalOpen] = useState(false);

  const fetchNinhadas = () => {
    apiFetch('/litters')
      .then((res) => {
        if (res.success) {
          setNinhadas(res.data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchNinhadas();
  }, []);

  const filtered = ninhadas.filter((n) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const mother = (n.mother_name ?? n.mother_id ?? '').toLowerCase();
    const father = (n.father_name ?? n.father_id ?? '').toLowerCase();
    const statusLabel = (STATUS_CONFIG[n.status]?.label ?? n.status ?? '').toLowerCase();
    return mother.includes(term) || father.includes(term) || statusLabel.includes(term);
  });

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
              placeholder="Buscar por mãe, pai ou data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <button
          onClick={() => setLitterModalOpen(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
        >
          <Plus size={18} />
          Registrar Parto
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] py-20 text-zinc-500">
          <Baby size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-medium">Nenhuma ninhada encontrada</p>
          <p className="text-sm mt-1">
            {searchTerm
              ? 'Tente ajustar sua busca.'
              : 'Clique em "Registrar Parto" para cadastrar a primeira.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((ninhada) => {
            const statusInfo = STATUS_CONFIG[ninhada.status] ?? {
              label: ninhada.status,
              className: 'bg-zinc-800 text-zinc-400 border-zinc-700',
            };
            const displayName = `Ninhada de ${ninhada.mother_name || ninhada.mother_id}`;
            const displayDate = formatDate(ninhada.birth_date, ninhada.expected_date);

            return (
              <div
                key={ninhada.id}
                onClick={() => onSelectNinhada(ninhada.id)}
                className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/40 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                      <Baby size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100">{displayName}</h3>
                      <p className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                        <Calendar size={12} /> {displayDate}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1 rounded-xl bg-zinc-800/30 p-3 border border-zinc-800/50">
                    <span className="text-xs text-zinc-500 text-center">Fêmeas</span>
                    <span className="text-lg font-bold text-white text-center">
                      {ninhada.female_count ?? ninhada.totalFemales ?? '—'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-xl bg-zinc-800/30 p-3 border border-zinc-800/50">
                    <span className="text-xs text-zinc-500 text-center">Machos</span>
                    <span className="text-lg font-bold text-white text-center">
                      {ninhada.male_count ?? ninhada.totalMales ?? '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mt-4 pt-4 border-t border-zinc-800/50">
                  <div className="flex flex-col gap-1">
                    <span>
                      Mãe:{' '}
                      <span className="text-zinc-300">
                        {ninhada.mother_name || ninhada.mother_id || '—'}
                      </span>
                    </span>
                    <span>
                      Pai:{' '}
                      <span className="text-zinc-300">
                        {ninhada.father_name || ninhada.father_id || '—'}
                      </span>
                    </span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-zinc-500 group-hover:text-brand-500 transition-colors self-end"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LitterModal
        isOpen={litterModalOpen}
        onClose={() => setLitterModalOpen(false)}
        onSaved={() => fetchNinhadas()}
        litter={null}
      />
    </div>
  );
}
