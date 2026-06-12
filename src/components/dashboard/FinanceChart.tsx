import { DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from './utils';

interface FinanceChartProps {
  data: Array<{ name: string; receitas: number; custos: number }>;
  yearIncome: number;
  yearExpense: number;
  yearProfit: number;
}

export function FinanceChart({ data, yearIncome, yearExpense, yearProfit }: FinanceChartProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-500" /> Situação Financeira
        </h3>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
              formatter={(value: any) => formatCurrency(Number(value))}
              itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}
            />
            <Bar dataKey="receitas" name="Receitas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="custos" name="Custos" fill="#9f1239" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Receita Anual</p>
          <p className="text-lg font-bold text-emerald-500">{formatCurrency(yearIncome)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Custo Anual</p>
          <p className="text-lg font-bold text-red-500">{formatCurrency(yearExpense)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Lucro Líquido</p>
          <p className={`text-lg font-bold ${yearProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(yearProfit)}
          </p>
        </div>
      </div>
    </div>
  );
}
