import { Dog } from 'lucide-react';
import { AnimalCost } from './types';
import { formatCurrency } from './constants';

interface CustosAnimalTableProps {
  animals: AnimalCost[];
  searchTerm: string;
  onSelectAnimal: (id: string) => void;
}

export function CustosAnimalTable({ animals, searchTerm, onSelectAnimal }: CustosAnimalTableProps) {
  if (animals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Dog size={48} className="mb-4 opacity-40" />
        <p className="text-lg font-medium">{searchTerm ? 'Nenhum animal encontrado' : 'Nenhum custo registrado'}</p>
        <p className="text-sm mt-1">Vincule despesas a animais na ficha do animal ou no Controle Financeiro.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-800/50 text-xs font-semibold uppercase text-zinc-300">
            <tr>
              <th className="px-5 py-3">Animal</th>
              <th className="px-5 py-3 text-center">Transações</th>
              <th className="px-5 py-3 text-red-400">Total Custos</th>
              <th className="px-5 py-3 text-emerald-400">Total Receitas</th>
              <th className="px-5 py-3 text-white">Saldo</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {animals.map((a) => {
              const balance = a.totalIncome - a.totalCost;
              return (
                <tr key={a.id} className="hover:bg-zinc-800/20 transition-colors cursor-pointer" onClick={() => onSelectAnimal(a.id)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 text-sm font-bold">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-200">{a.name}</span>
                        {a.breed && <span className="text-xs text-zinc-500 ml-2">{a.breed}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center text-zinc-400">{a.transactions}</td>
                  <td className="px-5 py-4 font-medium text-red-400">{formatCurrency(a.totalCost)}</td>
                  <td className="px-5 py-4 font-medium text-emerald-400">{formatCurrency(a.totalIncome)}</td>
                  <td className="px-5 py-4 font-bold">
                    <span className={balance >= 0 ? 'text-white' : 'text-red-400'}>{formatCurrency(balance)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-xs text-brand-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Ver detalhes →</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
