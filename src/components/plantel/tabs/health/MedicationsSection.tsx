import { Activity, HeartPulse, Pill, Plus } from 'lucide-react';

interface MedicationsSectionProps {
  medications: any[];
  formatDate: (d: string) => string;
  onAdd: () => void;
  onDelete: (target: { id: string; type: string }) => void;
}

export function MedicationsSection({ medications, formatDate, onAdd, onDelete }: MedicationsSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity size={20} className="text-amber-500" />
          Tratamentos e Medicamentos em Curso
        </h3>
        <button onClick={onAdd} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Adicionar Medicação
        </button>
      </div>
      {medications.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhuma medicação registrada.</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medications.filter((m: any) => m.status === 'ACTIVE').map((med: any) => (
          <div key={med.id} className="relative overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800/40 p-5 shadow-lg shadow-black/20">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
             <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                   <Pill size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-100">{med.name}</h4>
                  {med.notes && <span className="text-sm font-medium text-amber-500/80">{med.notes}</span>}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                <div className="flex flex-col">
                   <span className="text-xs text-zinc-500">Dose / Via</span>
                   <span className="font-medium text-zinc-300">{med.dose || '-'} {med.route ? `- ${med.route}` : ''}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-zinc-500">Frequência</span>
                   <span className="font-medium text-zinc-300">{med.frequency || '-'}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-zinc-500">Início</span>
                   <span className="font-medium text-zinc-300">{formatDate(med.start_date)}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-zinc-500">Fim Previsto</span>
                   <span className="font-medium text-zinc-300">{med.end_date ? formatDate(med.end_date) : '-'}</span>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={() => onDelete({ id: med.id, type: 'medications' })}
                  className="text-xs text-red-500 hover:text-red-400">Excluir</button>
              </div>
           </div>
        ))}
       </div>
       )}
     </div>
  );
}
