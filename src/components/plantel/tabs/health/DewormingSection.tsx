import { Plus } from 'lucide-react';

interface DewormingSectionProps {
  deworming: any[];
  isPastDue: (date: string | null) => boolean;
  formatDate: (d: string) => string;
  onEdit: (item: any) => void;
  onAdd: () => void;
  onDelete: (target: { id: string; type: string }) => void;
}

export function DewormingSection({ deworming, isPastDue, formatDate, onEdit, onAdd, onDelete }: DewormingSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">Controle de Parasitas</h3>
        <button onClick={onAdd} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Registrar Dose
        </button>
      </div>
      {deworming.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhum vermífugo registrado.</p>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-800/50 text-xs font-semibold uppercase text-zinc-300">
            <tr>
              <th className="px-4 py-3">Produto / Princípio Ativo</th>
              <th className="px-4 py-3">Dose</th>
              <th className="px-4 py-3">Peso na Data</th>
              <th className="px-4 py-3">Data de Aplicação</th>
              <th className="px-4 py-3">Próxima Dose</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {deworming.map((d: any) => {
              const pastDue = isPastDue(d.next_due_date);
              return (
              <tr key={d.id} className="hover:bg-zinc-800/20">
                <td className="px-4 py-4 font-medium text-zinc-200">
                  {d.product}
                  {d.active_ingredient && <span className="text-xs text-zinc-500 block">({d.active_ingredient})</span>}
                </td>
                <td className="px-4 py-4">{d.dose || '-'}</td>
                <td className="px-4 py-4">{d.weight_at_date ? `${d.weight_at_date} kg` : '-'}</td>
                <td className="px-4 py-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs">{formatDate(d.date)}</span></td>
                <td className="px-4 py-4">
                  <span className={`font-bold ${pastDue ? 'text-red-400' : 'text-emerald-400'}`}>
                    {d.next_due_date ? formatDate(d.next_due_date) : '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => onEdit(d)} className="text-xs underline text-zinc-500 hover:text-zinc-300">Editar</button>
                  <button onClick={() => onDelete({ id: d.id, type: 'deworming' })}
                    className="text-xs text-red-500 hover:text-red-400 ml-3">Excluir</button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
