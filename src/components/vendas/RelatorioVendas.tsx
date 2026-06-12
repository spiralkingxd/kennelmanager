import { ShoppingCart, DollarSign, TrendingUp, Calendar, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from './constants';

interface RelatorioVendasProps {
  totalSales: number;
  totalIncome: number;
  avgTicket: number;
  period: string;
  breedChartData: { name: string; value: number }[];
  topClients: { name: string; count: number; total: number }[];
}

export function RelatorioVendas({
  totalSales,
  totalIncome,
  avgTicket,
  period,
  breedChartData,
  topClients,
}: RelatorioVendasProps) {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <ShoppingCart size={20} className="text-brand-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Total de Vendas</span>
          <span className="text-2xl font-bold text-white">{totalSales}</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <DollarSign size={20} className="text-emerald-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500/80 block mb-1">Receita Total</span>
          <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <TrendingUp size={20} className="text-blue-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500/80 block mb-1">Ticket Médio</span>
          <span className="text-2xl font-bold text-blue-400">{formatCurrency(avgTicket)}</span>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <Calendar size={20} className="text-zinc-400 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Período</span>
          <span className="text-xl font-bold text-white">{period}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales by breed */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Vendas por Raça</h3>
          {breedChartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Nenhuma venda registrada</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={breedChartData.slice(0, 8)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top clients */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-brand-500" />
            <h3 className="text-lg font-bold text-white">Top Clientes</h3>
          </div>
          {topClients.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Nenhum cliente</div>
          ) : (
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={client.name} className="flex items-center gap-4 bg-zinc-800/30 p-3 rounded-xl border border-zinc-800/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-zinc-200 truncate block">{client.name}</span>
                    <span className="text-xs text-zinc-500">{client.count} compra(s)</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(client.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
