import { TrendingDown, TrendingUp, PieChart } from 'lucide-react';
import { formatCurrency } from './constants';

interface CustosDetailSummaryCardsProps {
  totalCost: number;
  totalIncome: number;
}

export function CustosDetailSummaryCards({ totalCost, totalIncome }: CustosDetailSummaryCardsProps) {
  const balance = totalIncome - totalCost;
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <TrendingDown size={18} className="text-red-500 mb-1" />
        <span className="text-xs font-bold uppercase tracking-wider text-red-500/80 block mb-1">Total Custos</span>
        <span className="text-2xl font-bold text-red-400">{formatCurrency(totalCost)}</span>
      </div>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <TrendingUp size={18} className="text-emerald-500 mb-1" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500/80 block mb-1">Total Receitas</span>
        <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</span>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
        <PieChart size={18} className="text-zinc-400 mb-1" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Saldo</span>
        <span className={`text-2xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
          {formatCurrency(balance)}
        </span>
      </div>
    </div>
  );
}
