import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from './constants';

interface CustosCategoryChartProps {
  expenseTransactions: any[];
}

export function CustosCategoryChart({ expenseTransactions }: CustosCategoryChartProps) {
  const catMap = new Map<string, number>();
  expenseTransactions.forEach((t: any) => {
    const cat = t.category || 'OTHER';
    catMap.set(cat, (catMap.get(cat) || 0) + Number(t.amount));
  });
  const chartData = Array.from(catMap.entries())
    .map(([name, value]) => ({ name: CATEGORY_LABELS[name] || name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="xl:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Custos por Categoria</h3>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
          Nenhum custo registrado
        </div>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[Object.keys(CATEGORY_LABELS).find(k => CATEGORY_LABELS[k] === entry.name) || 'OTHER'] || '#71717a'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            {chartData.slice(0, 8).map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded" style={{ backgroundColor: CATEGORY_COLORS[Object.keys(CATEGORY_LABELS).find(k => CATEGORY_LABELS[k] === entry.name) || 'OTHER'] || '#71717a' }} />
                <span className="text-zinc-400 flex-1">{entry.name}</span>
                <span className="font-medium text-zinc-200">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
