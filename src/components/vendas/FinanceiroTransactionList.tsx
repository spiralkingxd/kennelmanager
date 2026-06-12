import { Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatDate, CATEGORY_LABELS, getStatusBadge } from './constants';

interface TransactionListProps {
  transactions: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function FinanceiroTransactionList({ transactions, searchTerm, onSearchChange }: TransactionListProps) {
  const filteredTransactions = transactions.filter((t: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.description || '').toLowerCase().includes(term) ||
      (t.client_name || '').toLowerCase().includes(term) ||
      (t.puppy_name || '').toLowerCase().includes(term) ||
      (t.category || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="xl:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800">
        <h3 className="text-lg font-bold text-white">Transações Recentes</h3>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-36 rounded-lg border border-zinc-700 bg-zinc-800/50 pl-8 pr-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            Nenhuma transação encontrada
          </div>
        ) : (
          filteredTransactions.slice(0, 30).map((t: any) => {
            const isIncome = t.type === 'INCOME';
            const badge = getStatusBadge(t.status);
            return (
              <div key={t.id} className="flex justify-between items-center bg-zinc-800/30 p-3 rounded-xl border border-zinc-800/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-zinc-200 truncate max-w-[150px]" title={t.description || ''}>
                      {t.description || CATEGORY_LABELS[t.category] || t.category}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {t.client_name || formatDate(t.date)} • {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span className={`font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isIncome ? '+' : '-'} {formatCurrency(Number(t.amount))}
                  </span>
                  {t.status !== 'PAID' && (
                    <span className={`text-[10px] uppercase font-bold mt-0.5 px-1.5 py-0.5 rounded ${badge.className}`}>{badge.label}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
