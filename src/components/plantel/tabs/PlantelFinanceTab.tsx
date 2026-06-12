import { DollarSign, TrendingUp, TrendingDown, FileText, Activity, AlertCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../../shared/utils/apiFetch';
import { TransactionModal } from '../modals/TransactionModal';

export function PlantelFinanceTab({ dog }: { dog: any }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txModalOpen, setTxModalOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    apiFetch(`/financial?animalId=${dog.id}&take=100`)
      .then(res => {
        if (res.success) { setTransactions(res.data); setError(null); }
        else { setError('Erro ao carregar dados'); }
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [dog.id]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-zinc-500">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
      Carregando dados financeiros...
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-64 items-center justify-center text-zinc-500 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p>{error}</p>
      <button onClick={fetchData} className="text-sm text-brand-500 hover:underline">Tentar novamente</button>
    </div>
  );

  const incomes = transactions.filter((t: any) => t.type === 'INCOME');
  const expenses = transactions.filter((t: any) => t.type === 'EXPENSE');
  const totalIncome = incomes.reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
  const totalExpense = expenses.reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // Agrupar despesas por mês para o gráfico
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="space-y-8">
      {/* Botão Nova Transação */}
      <div className="flex justify-end">
        <button
          onClick={() => setTxModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-400 transition-colors"
        >
          <Plus size={16} /> Nova Transação
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
           <div className="mb-2 flex items-center justify-between">
             <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Custos Totais</span>
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
               <TrendingDown size={16} />
             </div>
           </div>
           <p className="text-2xl font-bold tracking-tight text-white mb-1">
             R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </p>
           <p className="text-xs text-zinc-500">{expenses.length} registros</p>
        </div>

        <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
           <div className="mb-2 flex items-center justify-between">
             <span className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">Receitas Geradas</span>
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
               <TrendingUp size={16} />
             </div>
           </div>
           <p className="text-2xl font-bold tracking-tight text-white mb-1">
             R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </p>
           <p className="text-xs text-zinc-500">{incomes.length} registros</p>
        </div>

        <div className="flex flex-col rounded-2xl border border-zinc-800 bg-brand-500/10 border-brand-500/30 p-5">
           <div className="mb-2 flex items-center justify-between">
             <span className="text-xs font-semibold uppercase text-brand-500/70 tracking-wider">Saldo Líquido</span>
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-500">
               <DollarSign size={16} />
             </div>
           </div>
           <p className="text-2xl font-bold tracking-tight text-brand-500 mb-1">
             R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </p>
           <p className="text-xs text-brand-500/60">
             {balance >= 0 ? 'Animal lucrativo' : 'Atenção aos custos'}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Extrato Recente */}
         <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col">
            <h3 className="mb-6 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
              <FileText size={16} className="text-zinc-500" /> Extrato Recente
            </h3>
            
            {transactions.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">Nenhuma movimentação financeira registrada.</p>
            ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
               {transactions.slice(0, 20).map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center bg-zinc-800/20 p-3 rounded-lg border border-zinc-800/50">
                    <div className="flex flex-col">
                       <span className="text-sm text-zinc-200">{item.description || item.category || 'Sem descrição'}</span>
                       <span className="text-xs text-zinc-500">{formatDate(item.date)}</span>
                       {item.category && <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{item.category}</span>}
                    </div>
                    <span className={`text-sm font-semibold whitespace-nowrap ${item.type === 'EXPENSE' ? 'text-red-400' : 'text-emerald-400'}`}>
                       {item.type === 'EXPENSE' ? '- ' : '+ '}
                       R$ {Number(item.amount).toFixed(2)}
                    </span>
                 </div>
               ))}
            </div>
            )}
         </div>

          <TransactionModal
            isOpen={txModalOpen}
            onClose={() => setTxModalOpen(false)}
            onSaved={fetchData}
            animalId={dog.id}
          />

          {/* Últimas movimentações em cards */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col">
            <h3 className="mb-6 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Activity size={16} className="text-zinc-500" /> Resumo por Categoria
            </h3>
            
            {transactions.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-8">Nenhum dado disponível.</p>
            ) : (
            <div className="space-y-3">
               {['FOOD', 'VET', 'VACCINES', 'EXAMS', 'MEDICATION', 'OTHER'].map(cat => {
                 const catTransactions = transactions.filter((t: any) => t.category === cat);
                 if (catTransactions.length === 0) return null;
                 const total = catTransactions.reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
                 return (
                   <div key={cat} className="flex justify-between items-center bg-zinc-800/20 p-3 rounded-lg border border-zinc-800/50">
                     <span className="text-sm font-medium text-zinc-300">{cat}</span>
                     <span className="text-sm font-semibold text-zinc-100">
                       R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </span>
                   </div>
                 );
               })}
            </div>
            )}
         </div>
      </div>
    </div>
  );
}
