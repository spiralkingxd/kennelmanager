import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from './constants';

interface SummaryCardsProps {
  monthIncome: number;
  monthExpenses: number;
  monthProfit: number;
}

export function FinanceiroSummaryCards({ monthIncome, monthExpenses, monthProfit }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 relative overflow-hidden">
        <TrendingUp className="absolute top-4 right-4 text-emerald-500/20" size={64} />
        <span className="text-sm font-bold uppercase tracking-wider text-emerald-500/80 mb-2 block">Receita (Mês)</span>
        <span className="text-3xl font-bold text-emerald-400">{formatCurrency(monthIncome)}</span>
      </div>
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 relative overflow-hidden">
        <TrendingDown className="absolute top-4 right-4 text-red-500/20" size={64} />
        <span className="text-sm font-bold uppercase tracking-wider text-red-500/80 mb-2 block">Custos (Mês)</span>
        <span className="text-3xl font-bold text-red-400">{formatCurrency(monthExpenses)}</span>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 relative overflow-hidden">
        <Wallet className="absolute top-4 right-4 text-zinc-800" size={64} />
        <span className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Lucro Líquido</span>
        <span className={`text-3xl font-bold ${monthProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
          {formatCurrency(monthProfit)}
        </span>
      </div>
    </div>
  );
}
