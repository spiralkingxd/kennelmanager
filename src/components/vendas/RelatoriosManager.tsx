import { PieChart, Download, ShoppingCart, Dog, DollarSign } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDate, CATEGORY_LABELS, monthNames, statusLabels } from './constants';
import { RelatorioFinanceiro } from './RelatorioFinanceiro';
import { RelatorioVendas } from './RelatorioVendas';
import { RelatorioAnimais } from './RelatorioAnimais';
import { apiFetch } from '../../shared/utils/apiFetch';

export function RelatoriosManager() {
  const [activeTab, setActiveTab] = useState('financeiro');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [animals, setAnimals] = useState<any[]>([]);
  const [puppies, setPuppies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'12m' | '6m' | '3m'>('12m');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [finJson, animJson, pupJson] = await Promise.all([
        apiFetch('/financial?take=10000'),
        apiFetch('/animals?limit=1000'),
        apiFetch('/puppies?limit=1000'),
      ]);

      if (finJson.success) setTransactions(finJson.data || []);
      if (animJson.success) setAnimals(animJson.data || []);
      if (pupJson.success) setPuppies(pupJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Period filtering ──────────────────────────────────────────────────
  const now = new Date();
  const periodMonths = period === '12m' ? 12 : period === '6m' ? 6 : 3;
  const cutoffDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1);
  const prevCutoffDate = new Date(now.getFullYear(), now.getMonth() - periodMonths * 2, 1);

  const filtered = transactions.filter((t: any) => {
    if (!t.date) return false;
    return new Date(t.date) >= cutoffDate;
  });

  const prevPeriod = transactions.filter((t: any) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d >= prevCutoffDate && d < cutoffDate;
  });

  // ─── Financial calculations ─────────────────────────────────────────────
  const totalIncome = filtered.filter((t: any) => t.type === 'INCOME' && t.status === 'PAID').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpense = filtered.filter((t: any) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s: number, t: any) => s + Number(t.amount), 0);

  const prevIncome = prevPeriod.filter((t: any) => t.type === 'INCOME' && t.status === 'PAID').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const prevExpense = prevPeriod.filter((t: any) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s: number, t: any) => s + Number(t.amount), 0);

  const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : '0';
  const expenseChange = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense * 100).toFixed(1) : '0';

  // ─── Category breakdown ────────────────────────────────────────────────
  const expenseByCategory = new Map<string, number>();
  const incomeByCategory = new Map<string, number>();
  filtered.forEach((t: any) => {
    const cat = t.category || 'OTHER';
    const amount = Number(t.amount);
    if (t.type === 'EXPENSE' && t.status === 'PAID') expenseByCategory.set(cat, (expenseByCategory.get(cat) || 0) + amount);
    if (t.type === 'INCOME' && t.status === 'PAID') incomeByCategory.set(cat, (incomeByCategory.get(cat) || 0) + amount);
  });

  const expenseChartData = Array.from(expenseByCategory.entries()).map(([n, v]) => ({ name: CATEGORY_LABELS[n] || n, value: v })).sort((a, b) => b.value - a.value);
  const incomeChartData = Array.from(incomeByCategory.entries()).map(([n, v]) => ({ name: CATEGORY_LABELS[n] || n, value: v })).sort((a, b) => b.value - a.value);

  // ─── Monthly evolution ──────────────────────────────────────────────────
  const monthlyData: { name: string; receita: number; despesa: number }[] = [];
  for (let i = periodMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`;
    const monthTx = filtered.filter((t: any) => {
      if (!t.date) return false;
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    monthlyData.push({
      name: label,
      receita: monthTx.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + Number(t.amount), 0),
      despesa: monthTx.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + Number(t.amount), 0),
    });
  }

  // ─── Sales report ──────────────────────────────────────────────────────
  const paidIncome = filtered.filter((t: any) => t.type === 'INCOME' && t.status === 'PAID');
  const totalSales = paidIncome.length;
  const avgTicket = totalSales > 0 ? totalIncome / totalSales : 0;

  const salesByBreed = new Map<string, number>();
  puppies.forEach((p: any) => {
    if (p.status === 'SOLD' && p.price) {
      const breed = p.breed || 'Outros';
      salesByBreed.set(breed, (salesByBreed.get(breed) || 0) + Number(p.price));
    }
  });
  const breedChartData = Array.from(salesByBreed.entries()).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value);

  const salesByClient = new Map<string, { count: number; total: number }>();
  transactions.forEach((t: any) => {
    if (t.type === 'INCOME' && t.status === 'PAID' && t.client_name) {
      const client = t.client_name;
      const prev = salesByClient.get(client) || { count: 0, total: 0 };
      salesByClient.set(client, { count: prev.count + 1, total: prev.total + Number(t.amount) });
    }
  });
  const topClients = Array.from(salesByClient.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // ─── Animal population report ──────────────────────────────────────────
  const bySex = { MALE: 0, FEMALE: 0 };
  const byStatus: Record<string, number> = {};
  const byBreed: Record<string, number> = {};
  animals.forEach((a: any) => {
    if (a.sex === 'MALE') bySex.MALE++;
    else bySex.FEMALE++;
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    const breed = a.breed || 'Outros';
    byBreed[breed] = (byBreed[breed] || 0) + 1;
  });
  const breedPopData = Object.entries(byBreed).map(([n, v]) => ({ name: n, value: v })).sort((a, b) => b.value - a.value);
  const statusPopData = Object.entries(byStatus).map(([n, v]) => ({ name: statusLabels[n] || n, value: v }));
  const sexPopData = [
    { name: 'Macho', value: bySex.MALE, color: '#3b82f6' },
    { name: 'Fêmea', value: bySex.FEMALE, color: '#ec4899' },
  ];

  const filteredTransactions = filtered.filter((t: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (t.description || '').toLowerCase().includes(term) ||
      (t.client_name || '').toLowerCase().includes(term) ||
      (t.category || '').toLowerCase().includes(term) ||
      formatCurrency(Number(t.amount)).includes(term);
  });

  const exportToCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Status', 'Cliente'];
    const rows = filteredTransactions.map((t: any) => [
      formatDate(t.date),
      t.type === 'INCOME' ? 'Receita' : 'Despesa',
      CATEGORY_LABELS[t.category] || t.category || '—',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      Number(t.amount).toFixed(2),
      t.status || '—',
      `"${(t.client_name || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span className="text-sm text-zinc-400">Carregando relatórios...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <PieChart size={40} className="text-red-500" />
          <p className="text-sm text-zinc-400">{error}</p>
          <button onClick={fetchAll} className="h-9 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Relatórios</h2>
          <p className="text-sm text-zinc-500">
            {activeTab === 'financeiro' && `${filtered.length} transações no período`}
            {activeTab === 'vendas' && `${totalSales} vendas realizadas`}
            {activeTab === 'animais' && `${animals.length} animais no plantel`}
          </p>
        </div>
        <div className="flex gap-2">
          {(['3m', '6m', '12m'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`h-9 rounded-lg px-3 text-xs font-bold transition-colors ${period === p ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'}`}>
              {p === '3m' ? '3 Meses' : p === '6m' ? '6 Meses' : '12 Meses'}
            </button>
          ))}
          <button onClick={exportToCSV} className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-800 px-3 text-xs font-bold text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 pb-px">
        {([
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
          { id: 'vendas', label: 'Vendas', icon: ShoppingCart },
          { id: 'animais', label: 'Animais', icon: Dog },
        ] as const).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-brand-500 text-brand-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'financeiro' && (
        <RelatorioFinanceiro
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          incomeChange={incomeChange}
          expenseChange={expenseChange}
          monthlyData={monthlyData}
          expenseChartData={expenseChartData}
          incomeChartData={incomeChartData}
          filteredTransactions={filteredTransactions}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      {activeTab === 'vendas' && (
        <RelatorioVendas
          totalSales={totalSales}
          totalIncome={totalIncome}
          avgTicket={avgTicket}
          period={period}
          breedChartData={breedChartData}
          topClients={topClients}
        />
      )}

      {activeTab === 'animais' && (
        <RelatorioAnimais
          animalsTotal={animals.length}
          bySex={bySex}
          byStatus={byStatus}
          breedPopData={breedPopData}
          statusPopData={statusPopData}
          sexPopData={sexPopData}
        />
      )}
    </div>
  );
}
