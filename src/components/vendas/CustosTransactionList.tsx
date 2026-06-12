import { Dog, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatDate, CATEGORY_LABELS } from './constants';

interface CustosTransactionListProps {
  transactions: any[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (id: string) => void;
}

export function CustosTransactionList({ transactions, loading, deletingId, onDelete }: CustosTransactionListProps) {
  return (
    <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">Movimentações</h3>
        <span className="text-xs text-zinc-500">{transactions.length} registro(s)</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <Dog size={32} className="mb-2 opacity-40" />
          <p className="text-sm">Nenhuma movimentação financeira</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {[...transactions].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-800/20 p-3 hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {t.type === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-zinc-200 truncate block max-w-[200px]" title={t.description || ''}>
                    {t.description || CATEGORY_LABELS[t.category] || t.category}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {CATEGORY_LABELS[t.category] || t.category} • {formatDate(t.date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                </span>
                <button onClick={() => onDelete(t.id)} disabled={deletingId === t.id}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                  {deletingId === t.id ? <div className="h-3 w-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
