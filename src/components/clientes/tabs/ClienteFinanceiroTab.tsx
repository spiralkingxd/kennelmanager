import { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../../shared/utils/apiFetch';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

const SALE_LABEL: Record<string, string> = {
  PENDING: 'Reservado',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelado',
};

const SALE_COLOR: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function ClienteFinanceiroTab({ clienteId }: { clienteId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await apiFetch('/sales?limit=1000');
        if (!cancelled) {
          if (json.success) {
            setData(json.data.filter((item: any) => item.client_id === clienteId));
          } else {
            setError(json.message || 'Erro ao carregar dados financeiros');
          }
        }
      } catch {
        if (!cancelled) setError('Erro de conexão ao servidor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [clienteId]);

  const completedDeals = data.filter(item => item.status === 'COMPLETED');
  const activeDeals = data.filter(item => item.status === 'PENDING');
  const totalInvested = completedDeals.reduce((acc, item) => acc + (parseFloat(item.total_value) || 0), 0);
  const pipelineTotal = activeDeals.reduce((acc, item) => acc + (parseFloat(item.total_value) || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="rounded-full bg-red-500/10 p-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 py-16">
        <DollarSign size={32} className="text-zinc-700 mb-3" />
        <p className="mb-1 text-lg font-medium text-zinc-400">Nenhum registro financeiro</p>
        <p className="text-sm text-center max-w-sm text-zinc-500">
          Este cliente ainda não possui vendas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Total Investido
          </div>
          <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalInvested)}</span>
          <span className="block text-xs text-zinc-600 mt-1">{completedDeals.length} negociação{completedDeals.length !== 1 ? 'ões' : ''} concluída{completedDeals.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2">
            <TrendingUp size={14} className="text-brand-500" />
            Negociações Ativas
          </div>
          <span className="text-2xl font-bold text-brand-400">{activeDeals.length}</span>
          <span className="block text-xs text-zinc-600 mt-1">{formatCurrency(pipelineTotal)} em pipeline</span>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-2">
            <DollarSign size={14} className="text-zinc-500" />
            Total de Registros
          </div>
          <span className="text-2xl font-bold text-zinc-200">{data.length}</span>
          <span className="block text-xs text-zinc-600 mt-1">negociação{data.length !== 1 ? 'ões' : ''} no total</span>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Vendas</h4>
        {data.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${SALE_COLOR[item.status] || 'bg-zinc-800 text-zinc-400'}`}>
                  {SALE_LABEL[item.status] || item.status}
                </span>
                {item.puppy_name && (
                  <span className="text-xs text-zinc-500">{item.puppy_name}</span>
                )}
              </div>
              {item.notes && (
                <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{item.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-semibold text-brand-500">{formatCurrency(item.total_value)}</span>
              <span className="text-xs text-zinc-600">{formatDate(item.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
