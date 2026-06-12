import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Edit3, Trash2, AlertTriangle, DollarSign, Receipt, Banknote } from 'lucide-react';
import { VendaModal } from './VendaModal';
import { apiFetch } from '../../shared/utils/apiFetch';
import { formatCurrency, SALE_STATUS_CONFIG, SALE_STATUS_OPTIONS, CONDITION_LABELS } from './constants';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('pt-BR'); }
  catch { return dateStr; }
}

export function RegistroVendasManager() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/sales?limit=1000');
      if (json.success) setData(json.data);
      else setError(json.message || 'Erro ao carregar vendas');
    } catch {
      setError('Erro de conexão ao servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completedRevenue = useMemo(() =>
    data
      .filter(s => s.status === 'COMPLETED')
      .reduce((acc, s) => acc + (parseFloat(s.total_value) || parseFloat(s.entry_value) || 0), 0),
    [data]
  );

  const pendingCount = useMemo(() =>
    data.filter(s => s.status === 'PENDING').length,
    [data]
  );

  const totalRecords = data.length;

  const filtered = useMemo(() => {
    return data.filter(s => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const name = (s.client_name || '').toLowerCase();
        if (!name.includes(q)) return false;
      }
      return true;
    });
  }, [data, searchTerm, statusFilter]);

  const handleEdit = (s: any) => {
    setEditingSale(s);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingSale(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda?')) return;
    try {
      const json = await apiFetch(`/sales/${id}`, { method: 'DELETE' });
      if (json.success) fetchData();
    } catch { /* ignore */ }
  };

  const handleSaved = () => {
    fetchData();
    setEditingSale(null);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Registro de Vendas</h2>
          <p className="text-sm text-zinc-500">
            {totalRecords} registro{totalRecords !== 1 ? 's' : ''} &middot; {formatCurrency(completedRevenue)} em vendas concluídas
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 relative overflow-hidden">
          <Banknote className="absolute top-4 right-4 text-emerald-500/20" size={64} />
          <span className="text-sm font-bold uppercase tracking-wider text-emerald-500/80 mb-2 block">Total Concluído</span>
          <span className="text-3xl font-bold text-emerald-400">{formatCurrency(completedRevenue)}</span>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 relative overflow-hidden">
          <Receipt className="absolute top-4 right-4 text-amber-500/20" size={64} />
          <span className="text-sm font-bold uppercase tracking-wider text-amber-500/80 mb-2 block">Reservas</span>
          <span className="text-3xl font-bold text-amber-400">{pendingCount}</span>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 relative overflow-hidden">
          <DollarSign className="absolute top-4 right-4 text-zinc-800" size={64} />
          <span className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Total de Registros</span>
          <span className="text-3xl font-bold text-white">{totalRecords}</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full max-w-lg">
          <div className="relative flex-1 group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {SALE_STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button onClick={handleNew}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all">
          <Plus size={18} /> Nova Venda
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-brand-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <p className="text-zinc-400 text-sm">{error}</p>
          <button onClick={fetchData}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] py-20 text-zinc-500">
          <DollarSign size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-medium">Nenhuma venda encontrada</p>
          <p className="text-sm mt-1 text-zinc-600">
            {searchTerm || statusFilter
              ? 'Tente ajustar os filtros para encontrar o que procura'
              : 'Registre a primeira venda para começar'}
          </p>
          {!searchTerm && !statusFilter && (
            <button onClick={handleNew}
              className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all">
              <Plus size={18} /> Criar Primeira Venda
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 text-xs font-semibold uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Cliente</th>
                  <th className="px-4 py-3">Filhote</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Condição</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-200">{s.client_name || '—'}</span>
                        {s.client_phone && <span className="text-xs text-zinc-500">{s.client_phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {s.puppy_name || '—'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-zinc-200">
                      {formatCurrency(parseFloat(s.total_value) || parseFloat(s.entry_value) || 0)}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {CONDITION_LABELS[s.condition] || s.condition || '—'}
                    </td>
                    <td className="px-4 py-4 text-zinc-400">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${SALE_STATUS_CONFIG[s.status]?.className || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                        {SALE_STATUS_CONFIG[s.status]?.label || s.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(s)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-brand-400 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VendaModal */}
      <VendaModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSale(null); }}
        onSaved={handleSaved}
        venda={editingSale}
      />
    </div>
  );
}
