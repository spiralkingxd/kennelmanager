import { Dog, Search, Filter, X, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect, Fragment } from 'react';
import type { Puppy } from './types';
import { STATUS_MAP } from './constants';
import { PuppyCard } from './PuppyCard';
import { PuppyDetailModal } from './PuppyDetailModal';
import { ReservarModal } from './ReservarModal';
import { apiFetch } from '../../shared/utils/apiFetch';

export function FilhotesStatusManager() {
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [litterFilter, setLitterFilter] = useState<string>('');
  const [litters, setLitters] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailPuppy, setDetailPuppy] = useState<Puppy | null>(null);
  const [reservePuppy, setReservePuppy] = useState<Puppy | null>(null);

  const fetchPuppies = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/puppies?limit=1000');
      if (json.success) {
        setPuppies(json.data);
      } else {
        setError('Erro ao carregar filhotes');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPuppies(); }, []);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch('/litters', { signal: controller.signal })
      .then(res => { if (res.success) setLitters(res.data); })
      .catch((err: any) => { if (err.name !== 'AbortError') console.error('Erro ao carregar ninhadas:', err); });
    return () => controller.abort();
  }, []);

  const handleStatusChange = async (puppyId: string, newStatus: string, puppyName: string) => {
    const confirmMsg: Record<string, string> = {
      SOLD: `Confirmar venda de "${puppyName || 'filhote'}"? Esta ação marca como vendido.`,
    };
    if (!window.confirm(confirmMsg[newStatus as keyof typeof confirmMsg] || `Alterar status?`)) return;

    setActionLoading(puppyId);
    try {
      const json = await apiFetch(`/puppies/${puppyId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (json.success) {
        fetchPuppies();
      } else {
        alert('Erro ao atualizar status');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = puppies.filter((p) => {
    if (litterFilter && p.litter_id !== litterFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(term) ||
      (p.mother_name || '').toLowerCase().includes(term) ||
      (p.father_name || '').toLowerCase().includes(term) ||
      (p.color || '').toLowerCase().includes(term) ||
      (p.client_name || '').toLowerCase().includes(term)
    );
  });

  const filterOptions = Object.entries(STATUS_MAP).filter(([key]) => key !== statusFilter);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Disponibilidade</h2>
          <p className="text-sm text-zinc-500">
            {loading ? 'Carregando...' : `${filtered.length} filhote${filtered.length !== 1 ? 's' : ''}${statusFilter ? ` (${STATUS_MAP[statusFilter]?.label || statusFilter})` : ''}${litterFilter ? ` • ${litters.find(l => l.id === litterFilter)?.mother_name || 'Ninhada'}` : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full max-w-lg">
          <div className="relative flex-1 group">
            <Search size={18} className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500" style={{ top: '50%', transform: 'translateY(-50%)', position: 'absolute' }} />
            <input
              type="text"
              placeholder="Buscar por nome, cor, mãe ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <select
            value={litterFilter}
            onChange={(e) => setLitterFilter(e.target.value)}
            aria-label="Filtrar por ninhada"
            className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          >
            <option value="">Todas as ninhadas</option>
            {litters.map(lit => (
              <option key={lit.id} value={lit.id}>
                {lit.mother_name || 'Ninhada'} — {lit.birth_date ? new Date(lit.birth_date).toLocaleDateString('pt-BR') : lit.status || 'sem data'}
              </option>
            ))}
          </select>
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                statusFilter
                  ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                  : 'border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Filter size={18} />
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 z-50 w-52 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="p-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2">Filtrar por status</span>
                </div>
                {statusFilter && (
                  <button
                    onClick={() => { setStatusFilter(''); setShowFilter(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
                  >
                    <X size={14} /> Limpar filtro
                  </button>
                )}
                {filterOptions.map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => { setStatusFilter(key); setShowFilter(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${cfg.className.split(' ')[0]}`} />
                    {cfg.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={fetchPuppies}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Atualizar"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Estado de erro */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-800 p-4">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
          <button onClick={fetchPuppies} className="text-sm font-medium text-red-400 hover:text-red-300 underline">Tentar novamente</button>
        </div>
      )}

      {/* Estado de loading */}
      {loading && !error && (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-brand-500" />
            <p className="text-sm font-medium text-zinc-400">Carregando filhotes...</p>
          </div>
        </div>
      )}

      {/* Grid de filhotes */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] py-20 text-zinc-500">
          <Dog size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-medium">Nenhum filhote encontrado</p>
          <p className="text-sm mt-1">
            {searchTerm || statusFilter || litterFilter
              ? 'Tente ajustar os filtros ou selecione "Todas as ninhadas".'
              : 'Cadastre filhotes através das ninhadas para vê-los aqui.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <Fragment key={p.id}>
              <PuppyCard
                puppy={p}
                onStatusChange={handleStatusChange}
                onReserve={setReservePuppy}
                onViewDetail={setDetailPuppy}
                actionLoading={actionLoading}
              />
            </Fragment>
          ))}
        </div>
      )}

      {detailPuppy && (
        <PuppyDetailModal
          puppy={detailPuppy}
          onClose={() => setDetailPuppy(null)}
        />
      )}

      <ReservarModal
        isOpen={!!reservePuppy}
        puppy={reservePuppy}
        onClose={() => setReservePuppy(null)}
        onSaved={fetchPuppies}
      />
    </div>
  );
}
