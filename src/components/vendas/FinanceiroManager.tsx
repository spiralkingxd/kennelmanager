import { Download, Plus, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { FinanceiroModal } from './FinanceiroModal';
import { FinanceiroSummaryCards } from './FinanceiroSummaryCards';
import { FinanceiroChart } from './FinanceiroChart';
import { FinanceiroTransactionList } from './FinanceiroTransactionList';
import { FinanceiroAnimalProfitTable } from './FinanceiroAnimalProfitTable';
import { MonthlyData, AnimalProfit } from './types';
import { apiFetch } from '../../shared/utils/apiFetch';

// RFC 4180 minimal CSV field escaping: wrap in quotes if contains ", , or newline.
const escapeCSV = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export function FinanceiroManager() {
  const [activeTab, setActiveTab] = useState('fluxo');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | 'MONTH' | 'QUARTER' | 'YEAR'>('ALL');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/financial?take=1000');
      if (json.success) {
        setTransactions(json.data || []);
      } else {
        setError('Erro ao carregar transações');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Summary calculations ────────────────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = transactions.filter((t: any) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIncome = monthTransactions
    .filter((t: any) => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const monthExpenses = monthTransactions
    .filter((t: any) => t.type === 'EXPENSE' && t.status === 'PAID')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const monthProfit = monthIncome - monthExpenses;

  // ─── Chart data (last 12 months) ──────────────────────────────────────────
  const monthlyData: MonthlyData[] = [];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const label = `${monthNames[month]}/${year.toString().slice(2)}`;

    const monthTx = transactions.filter((t: any) => {
      if (!t.date) return false;
      const td = new Date(t.date);
      return td.getMonth() === month && td.getFullYear() === year;
    });

    monthlyData.push({
      name: label,
      receita: monthTx.filter((t: any) => t.type === 'INCOME' && t.status === 'PAID').reduce((s: number, t: any) => s + Number(t.amount), 0),
      despesa: monthTx.filter((t: any) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s: number, t: any) => s + Number(t.amount), 0),
    });
  }

  // ─── Lucro por Animal ────────────────────────────────────────────────────
  const animalProfitMap = new Map<string, AnimalProfit>();
  transactions.forEach((t: any) => {
    if (!t.animal_id) return;
    if (!animalProfitMap.has(t.animal_id)) {
      animalProfitMap.set(t.animal_id, {
        id: t.animal_id,
        name: t.animal_name || t.animal_id.slice(0, 8),
        breed: t.animal_breed || '',
        revenue: 0,
        costs: 0,
        profit: 0,
        totalTransactions: 0,
      });
    }
    const entry = animalProfitMap.get(t.animal_id)!;
    entry.totalTransactions++;
    if (t.type === 'INCOME') entry.revenue += Number(t.amount);
    if (t.type === 'EXPENSE') entry.costs += Number(t.amount);
    entry.profit = entry.revenue - entry.costs;
  });
  const animalProfitList = Array.from(animalProfitMap.values()).sort((a, b) => b.profit - a.profit);

  // ─── Filtros (type, status, date) ─────────────────────────────────────────
  const filteredTransactions = transactions.filter((t: any) => {
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (dateRange !== 'ALL') {
      const d = new Date(t.date);
      const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (dateRange === 'MONTH' && monthsDiff > 0) return false;
      if (dateRange === 'QUARTER' && monthsDiff > 3) return false;
      if (dateRange === 'YEAR' && monthsDiff > 12) return false;
    }
    return true;
  });
  const filteredSummary = filteredTransactions.filter((t: any) => t.status === 'PAID');
  const filteredIncome = filteredSummary.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + Number(t.amount), 0);
  const filteredExpenses = filteredSummary.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + Number(t.amount), 0);

  // ─── Exportar CSV (transações filtradas) ─────────────────────────────────
  const handleExport = useCallback(() => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Status', 'Cliente', 'Filhote', 'Animal', 'Ninhada', 'Descrição'];
    const rows = filteredTransactions.map((t: any) => [
      t.date,
      t.type,
      t.category ?? '',
      t.amount,
      t.status,
      t.client_name ?? '',
      t.puppy_name ?? '',
      t.animal_name ?? '',
      t.litter_name ?? '',
      t.description ?? '',
    ]);
    // BOM para Excel abrir com encoding correto.
    const csv = '\uFEFF' + [headers, ...rows]
      .map(row => row.map(escapeCSV).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span className="text-sm text-zinc-400">Carregando dados financeiros...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-sm text-zinc-400">{error}</p>
          <button onClick={fetchData} className="h-9 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Controle Financeiro</h2>
          <p className="text-sm text-zinc-500">
            {transactions.length} transações registradas
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 px-4 text-sm font-semibold text-white hover:bg-zinc-700 transition-all">
            <Download size={18} /> Exportar
          </button>
          <button onClick={() => setModalOpen(true)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all">
            <Plus size={18} /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'INCOME' | 'EXPENSE')}
          className="h-9 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="ALL">Todos os tipos</option>
          <option value="INCOME">Receitas</option>
          <option value="EXPENSE">Despesas</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE')}
          className="h-9 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="ALL">Todos os status</option>
          <option value="PAID">Pago</option>
          <option value="PENDING">Pendente</option>
          <option value="OVERDUE">Vencido</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as 'ALL' | 'MONTH' | 'QUARTER' | 'YEAR')}
          className="h-9 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-xs text-zinc-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="ALL">Todo período</option>
          <option value="MONTH">Este mês</option>
          <option value="QUARTER">Últimos 3 meses</option>
          <option value="YEAR">Último ano</option>
        </select>
        <div className="text-xs text-zinc-500 self-center ml-1">
          {filteredTransactions.length} de {transactions.length} transações
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 pb-px">
        <button
          onClick={() => setActiveTab('fluxo')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'fluxo' ? 'border-brand-500 text-brand-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          Fluxo de Caixa
        </button>
        <button
          onClick={() => setActiveTab('lucratividade')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'lucratividade' ? 'border-brand-500 text-brand-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          Lucro por Animal
        </button>
      </div>

      {activeTab === 'fluxo' && (
        <div className="space-y-6">
          <FinanceiroSummaryCards
            monthIncome={filteredIncome}
            monthExpenses={filteredExpenses}
            monthProfit={filteredIncome - filteredExpenses}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <FinanceiroChart monthlyData={monthlyData} />
            <FinanceiroTransactionList
              transactions={filteredTransactions}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>
      )}

      {activeTab === 'lucratividade' && (
        <FinanceiroAnimalProfitTable animalProfitList={animalProfitList} />
      )}

      {/* Modal */}
      <FinanceiroModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
