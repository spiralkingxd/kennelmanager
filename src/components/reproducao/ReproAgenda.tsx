import { Calendar, Heart, Baby, Activity } from 'lucide-react';

// ─── ReproAgenda ──────────────────────────────────────────────────────────────

interface ReproAgendaProps {
  upcomingEvents: { date: string; title: string; type: string; animalName: string }[];
}

export function ReproAgenda({ upcomingEvents }: ReproAgendaProps) {
  return (
    <div className="xl:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar size={18} className="text-brand-500" />
          Agenda Reprodutiva
        </h3>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar size={32} className="text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-500">Nenhum evento próximo</p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-zinc-800 ml-1">
          {upcomingEvents.slice(0, 10).map((evento, idx) => (
            <div key={idx} className="relative flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 z-10 relative -left-[1px]">
                {evento.type === 'cobertura' && <Heart size={12} className="text-pink-400" />}
                {evento.type === 'parto' && <Baby size={12} className="text-purple-400" />}
                {evento.type === 'desmame' && <Activity size={12} className="text-blue-400" />}
              </div>
              <div className="flex flex-col pt-1 flex-1">
                <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-[10px] font-bold text-zinc-400 w-max mb-1 border border-zinc-700/50">
                  {evento.date}
                </span>
                <span className="text-sm font-medium text-zinc-200">{evento.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="mt-8 w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700">
        Ver Calendário Completo
      </button>
    </div>
  );
}
