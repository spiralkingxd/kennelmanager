import { TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { CATEGORY_COLORS, CATEGORY_LABELS, formatCurrency, formatDate } from './constants';

interface RelatorioFinanceiroProps {
  totalIncome: number;
  totalExpense: number;
  incomeChange: string;
  expenseChange: string;
  monthlyData: { name: string; receita: number; despesa: number }[];
  expenseChartData: { name: string; value: number }[];
  incomeChartData: { name: string; value: number }[];
  filteredTransactions: any[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

export function RelatorioFinanceiro({
  totalIncome,
  totalExpense,
  incomeChange,
  expenseChange,
  monthlyData,
  expenseChartData,
  incomeChartData,
  filteredTransactions,
  searchTerm,
  setSearchTerm,
}: RelatorioFinanceiroProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards c/ comparativo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <TrendingUp size={20} className="text-emerald-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500/80 block mb-1">Receitas</span>
          <span className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</span>
          <span className={`text-xs font-medium mt-1 block ${Number(incomeChange) >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {Number(incomeChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(incomeChange))}% vs período anterior
          </span>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <TrendingDown size={20} className="text-red-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-500/80 block mb-1">Despesas</span>
          <span className="text-2xl font-bold text-red-400">{formatCurrency(totalExpense)}</span>
          <span className={`text-xs font-medium mt-1 block ${Number(expenseChange) <= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {Number(expenseChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(expenseChange))}% vs período anterior
          </span>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <DollarSign size={20} className="text-brand-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Resultado</span>
          <span className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 h-[350px]">
          <h3 className="text-lg font-bold text-white mb-4">Evolução Mensal</h3>
          {monthlyData.some(d => d.receita > 0 || d.despesa > 0) ? (
            <ResponsiveContainer width="100%" height="82%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="recC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="despC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#71717a" axisLine={false} tickLine={false} dx={-10} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="receita" stroke="#10b981" fill="url(#recC)" strokeWidth={2} name="Receitas" />
                <Area type="monotone" dataKey="despesa" stroke="#ef4444" fill="url(#despC)" strokeWidth={2} name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[82%] text-zinc-500 text-sm">Nenhum dado no período</div>
          )}
        </div>

        {/* Transaction table */}
        <div className="xl:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Transações</h3>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 w-36 rounded-lg border border-zinc-700 bg-zinc-800/50 pl-8 pr-2 text-[11px] text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTransactions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Nenhuma transação</div>
            ) : (
              filteredTransactions.slice(0, 30).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between bg-zinc-800/20 p-2.5 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {t.type === 'INCOME' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-zinc-200 truncate block max-w-[140px]">{t.description || CATEGORY_LABELS[t.category] || t.category}</span>
                      <span className="text-[10px] text-zinc-500">{formatDate(t.date)}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Despesas por Categoria', data: expenseChartData, empty: 'Nenhuma despesa', colors: CATEGORY_COLORS },
          { title: 'Receitas por Categoria', data: incomeChartData, empty: 'Nenhuma receita', colors: CATEGORY_COLORS },
        ].map((section) => (
          <div key={section.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-lg font-bold text-white mb-4">{section.title}</h3>
            {section.data.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">{section.empty}</div>
            ) : (
              <div className="flex items-center gap-4 h-80">
                <ResponsiveContainer width="60%" height="100%">
                  <RechartsPie>
                    <Pie data={section.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {section.data.map((entry: any) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[Object.keys(CATEGORY_LABELS).find(k => CATEGORY_LABELS[k] === entry.name) || 'OTHER'] || '#71717a'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 text-xs">
                  {section.data.slice(0, 8).map((entry: any) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: CATEGORY_COLORS[Object.keys(CATEGORY_LABELS).find(k => CATEGORY_LABELS[k] === entry.name) || 'OTHER'] || '#71717a' }} />
                      <span className="text-zinc-400">{entry.name}</span>
                      <span className="font-medium text-zinc-200 ml-auto">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
