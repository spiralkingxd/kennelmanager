import { PieChart } from 'lucide-react';
import { formatCurrency } from './constants';
import { AnimalProfit } from './types';

interface AnimalProfitTableProps {
  animalProfitList: AnimalProfit[];
}

export function FinanceiroAnimalProfitTable({ animalProfitList }: AnimalProfitTableProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h3 className="text-lg font-bold text-white mb-2">Rentabilidade por Animal</h3>
      <p className="text-sm text-zinc-500 mb-6">{animalProfitList.length} animais com movimentações financeiras</p>

      {animalProfitList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <PieChart size={48} className="mb-3 opacity-40" />
          <p className="text-sm">Nenhum lançamento financeiro vinculado a animais.</p>
          <p className="text-xs mt-1">Crie despesas/receitas na ficha do animal para ver a rentabilidade aqui.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs font-semibold uppercase text-zinc-300">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Animal</th>
                <th className="px-4 py-3 text-center">Movimentações</th>
                <th className="px-4 py-3 text-emerald-400">Total Receitas</th>
                <th className="px-4 py-3 text-red-400">Total Custos</th>
                <th className="px-4 py-3 text-white rounded-tr-lg">Lucro Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {animalProfitList.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-200">{item.name}</span>
                        {item.breed && <span className="text-xs text-zinc-500 ml-2">{item.breed}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">{item.totalTransactions}</td>
                  <td className="px-4 py-4 font-medium text-emerald-400">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-4 font-medium text-red-400">{formatCurrency(item.costs)}</td>
                  <td className="px-4 py-4 font-bold text-white">{formatCurrency(item.profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
