import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyData } from './types';

interface ChartProps {
  monthlyData: MonthlyData[];
}

export function FinanceiroChart({ monthlyData }: ChartProps) {
  return (
    <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 h-[400px]">
      <h3 className="text-lg font-bold text-white mb-4">Evolução Mensal (12 meses)</h3>
      {monthlyData.some(d => d.receita > 0 || d.despesa > 0) ? (
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
            <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} dy={10} />
            <YAxis stroke="#71717a" axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => `R$${val / 1000}k`} />
            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
            <Area type="monotone" dataKey="receita" stroke="#10b981" fillOpacity={1} fill="url(#colorReceita)" strokeWidth={2} />
            <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesa)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[85%] text-zinc-500 text-sm">
          Nenhum dado financeiro para exibir no gráfico
        </div>
      )}
    </div>
  );
}
