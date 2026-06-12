import { Syringe, AlertCircle, CheckCircle2, Plus } from 'lucide-react';

interface VaccinesSectionProps {
  vaccines: any[];
  isPastDue: (date: string | null) => boolean;
  formatDate: (d: string) => string;
  onAdd: () => void;
  onDelete: (target: { id: string; type: string }) => void;
}

export function VaccinesSection({ vaccines, isPastDue, formatDate, onAdd, onDelete }: VaccinesSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">Carteira de Vacinação Digital</h3>
        <button onClick={onAdd} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Nova Vacina
        </button>
      </div>
      {vaccines.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhuma vacina registrada.</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaccines.map((v: any) => {
          const pastDue = isPastDue(v.next_due_date);
          return (
          <div key={v.id} className="relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 ${pastDue ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                  <Syringe size={18} className={pastDue ? 'text-amber-500' : 'text-emerald-500'} />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100">{v.name}</h4>
                  <span className="text-xs text-zinc-500">{v.manufacturer || ''}{v.batch ? ` • Lote: ${v.batch}` : ''}</span>
                </div>
              </div>
              {pastDue ? <AlertCircle size={20} className="text-amber-500" /> : <CheckCircle2 size={20} className="text-emerald-500" />}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2 relative z-10">
              <div className="flex flex-col gap-1 bg-zinc-800/30 p-2 rounded-lg">
                <span className="text-xs text-zinc-500">Data de Aplicação</span>
                <span className="font-medium text-zinc-300">{formatDate(v.date)}</span>
              </div>
              <div className="flex flex-col gap-1 bg-zinc-800/30 p-2 rounded-lg border border-zinc-700/50">
                <span className="text-xs text-zinc-500">Próxima Dose</span>
                <span className={`font-bold ${pastDue ? 'text-amber-500' : 'text-emerald-500'}`}>{v.next_due_date ? formatDate(v.next_due_date) : '-'}</span>
              </div>
              <div className="col-span-2 flex flex-col gap-1 mt-2">
                <span className="text-xs text-zinc-500">Veterinário / Clínica</span>
                <span className="text-sm text-zinc-400">{v.vet_name || '-'}{v.clinic ? ` - ${v.clinic}` : ''}</span>
              </div>
              <div className="col-span-2 flex justify-end mt-2">
                <button onClick={() => onDelete({ id: v.id, type: 'vaccines' })}
                  className="text-xs text-red-500 hover:text-red-400">Excluir</button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
