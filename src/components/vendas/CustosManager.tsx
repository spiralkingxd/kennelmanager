import { useState, useEffect, useCallback } from 'react';
import { AnimalCost } from './types';
import { CustosLoadingState } from './CustosLoadingState';
import { CustosErrorState } from './CustosErrorState';
import { CustosDetailHeader } from './CustosDetailHeader';
import { CustosDetailSummaryCards } from './CustosDetailSummaryCards';
import { CustosTransactionList } from './CustosTransactionList';
import { CustosCategoryChart } from './CustosCategoryChart';
import { CustosListHeader } from './CustosListHeader';
import { CustosListSummaryCards } from './CustosListSummaryCards';
import { CustosAnimalTable } from './CustosAnimalTable';
import { apiFetch } from '../../shared/utils/apiFetch';

export function CustosManager() {
  const [animals, setAnimals] = useState<AnimalCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'cost' | 'name'>('cost');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [animalTransactions, setAnimalTransactions] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/financial?take=10000');
      if (!json.success) throw new Error('Erro ao carregar dados');

      const transactions = json.data || [];
      const animalMap = new Map<string, AnimalCost>();

      transactions.forEach((t: any) => {
        if (!t.animal_id) return;
        if (!animalMap.has(t.animal_id)) {
          animalMap.set(t.animal_id, {
            id: t.animal_id,
            name: t.animal_name || t.animal_id.slice(0, 8),
            breed: t.animal_breed || null,
            totalCost: 0,
            totalIncome: 0,
            transactions: 0,
          });
        }
        const entry = animalMap.get(t.animal_id)!;
        entry.transactions++;
        if (t.type === 'EXPENSE' && t.status === 'PAID') entry.totalCost += Number(t.amount);
        if (t.type === 'INCOME' && t.status === 'PAID') entry.totalIncome += Number(t.amount);
      });

      const list = Array.from(animalMap.values());
      list.sort((a, b) => sortBy === 'cost' ? b.totalCost - a.totalCost : a.name.localeCompare(b.name));
      setAnimals(list);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchAnimalTransactions = useCallback(async (animalId: string) => {
    setDetailLoading(true);
    try {
      const json = await apiFetch(`/financial?animalId=${animalId}&take=500`);
      if (json.success) setAnimalTransactions(json.data || []);
    } catch {
      // Silent
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSelectAnimal = (id: string) => {
    setSelectedAnimalId(id);
    fetchAnimalTransactions(id);
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) return;
    setDeletingId(txId);
    try {
      const json = await apiFetch(`/financial/${txId}`, { method: 'DELETE' });
      if (json.success) {
        if (selectedAnimalId) fetchAnimalTransactions(selectedAnimalId);
        fetchData();
      } else alert('Erro ao excluir');
    } catch {
      alert('Erro de conexão');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnimals = animals.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.breed || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCostAll = animals.reduce((s, a) => s + a.totalCost, 0);
  const totalIncomeAll = animals.reduce((s, a) => s + a.totalIncome, 0);

  const selectedAnimal = animals.find((a) => a.id === selectedAnimalId);
  const expenseTransactions = animalTransactions.filter((t: any) => t.type === 'EXPENSE');

  if (loading) return <CustosLoadingState />;

  if (error) return <CustosErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {selectedAnimalId && selectedAnimal ? (
        <>
          <CustosDetailHeader
            name={selectedAnimal.name}
            breed={selectedAnimal.breed}
            transactions={selectedAnimal.transactions}
            onBack={() => { setSelectedAnimalId(null); setAnimalTransactions([]); }}
          />
          <CustosDetailSummaryCards
            totalCost={selectedAnimal.totalCost}
            totalIncome={selectedAnimal.totalIncome}
          />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <CustosTransactionList
              transactions={animalTransactions}
              loading={detailLoading}
              deletingId={deletingId}
              onDelete={handleDeleteTransaction}
            />
            <CustosCategoryChart expenseTransactions={expenseTransactions} />
          </div>
        </>
      ) : (
        <>
          <CustosListHeader
            animalCount={animals.length}
            sortBy={sortBy}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
          />
          <CustosListSummaryCards
            totalCost={totalCostAll}
            totalIncome={totalIncomeAll}
          />
          <CustosAnimalTable
            animals={filteredAnimals}
            searchTerm={searchTerm}
            onSelectAnimal={handleSelectAnimal}
          />
        </>
      )}
    </div>
  );
}
