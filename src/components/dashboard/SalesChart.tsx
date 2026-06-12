import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from './utils';

interface SalesChartProps {
  data: Array<{ name: string; vendas: number }>;
  puppiesSoldYear: number;
  monthIncome: number;
}

export function SalesChart({ data, puppiesSoldYear, monthIncome }: SalesChartProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
      <h3 className="font-bold text-white flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-brand-500" /> Desempenho de Vendas
      </h3>
      <div className="h-32 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="vendas" stroke="#f59e0b" fillOpacity={1} fill="url(#colorVendas)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-800">
          <p className="text-[10px] text-zinc-500">Filhotes Vendidos (Ano)</p>
          <p className="text-sm font-bold text-white">{puppiesSoldYear} filhotes</p>
        </div>
        <div className="bg-zinc-800/40 p-2 rounded-lg border border-zinc-800">
          <p className="text-[10px] text-zinc-500">Receita (Mês)</p>
          <p className="text-sm font-bold text-white">{formatCurrency(monthIncome)}</p>
        </div>
      </div>
    </div>
  );
}
