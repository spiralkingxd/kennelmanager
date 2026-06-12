import { Stethoscope, Plus } from 'lucide-react';

interface ConsultationsSectionProps {
  consultations: any[];
  formatDate: (d: string) => string;
  onAdd: () => void;
}

export function ConsultationsSection({ consultations, formatDate, onAdd }: ConsultationsSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">Histórico Clínico</h3>
        <button onClick={onAdd} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Registrar Consulta
        </button>
      </div>
      {consultations.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhuma consulta registrada.</p>
      ) : (
      <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-zinc-800 ml-2">
         {consultations.map((c: any) => (
           <div key={c.id} className="relative flex gap-6">
             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 z-10 relative -left-4">
               <Stethoscope size={14} />
             </div>
             <div className="flex-1 bg-zinc-800/30 border border-zinc-800/50 rounded-xl p-5 hover:bg-zinc-800/50 transition-colors">
               <div className="flex justify-between items-start mb-4 border-b border-zinc-800/50 pb-3">
                 <div>
                   <span className="bg-zinc-900 border border-zinc-700 text-xs font-medium px-2 py-1 rounded text-zinc-300 mb-2 inline-block">Data: {formatDate(c.date)}</span>
                   <h4 className="font-bold text-zinc-200 mt-1">Motivo: {c.reason}</h4>
                 </div>
                 {c.value && <span className="text-sm font-medium text-zinc-500">R$ {Number(c.value).toFixed(2)}</span>}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <div className="flex flex-col gap-1">
                   <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Diagnóstico</span>
                   <span className="text-zinc-300">{c.diagnosis || '-'}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tratamento Prescrito</span>
                   <span className="text-zinc-300">{c.treatment || '-'}</span>
                 </div>
                 <div className="flex flex-col gap-1 md:col-span-2">
                   <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Medicações</span>
                   <span className="text-zinc-300 bg-zinc-900/50 p-2 rounded border border-zinc-800 mt-1">{c.medications || '-'}</span>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>
       )}
     </div>
  );
}
