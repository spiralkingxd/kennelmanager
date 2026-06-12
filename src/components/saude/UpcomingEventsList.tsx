import { Calendar, CheckCircle2 } from 'lucide-react';
import { formatDate, getDateStatus, getEventIcon, getEventColor } from './utils';

export interface UpcomingEvent {
  id: string;
  type: 'vaccine' | 'deworming';
  procedure: string;
  animalName: string;
  animalBreed: string;
  expectedDate: string;
}

interface UpcomingEventsListProps {
  events: UpcomingEvent[];
}

export function UpcomingEventsList({ events }: UpcomingEventsListProps) {
  return (
    <div className="xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar size={18} className="text-brand-500" />
          Próximos Vencimentos (30 dias)
        </h2>
        <span className="text-xs text-zinc-500">{events.length} registro(s)</span>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 size={40} className="text-emerald-500/50 mb-3" />
          <p className="text-sm font-medium text-zinc-400">Nenhum vencimento nos próximos 30 dias</p>
          <p className="text-xs text-zinc-600 mt-1">Todos os animais estão em dia com vacinas e vermífugos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={`${event.type}-${event.id}`} className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-800/30 p-4 transition-colors hover:bg-zinc-800/60">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-100">{event.procedure}</span>
                  <span className="text-xs font-medium text-zinc-400">{event.animalName} · {event.animalBreed}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-zinc-500">Data Prevista</span>
                  <span className={`text-sm font-bold ${getDateStatus(event.expectedDate)}`}>
                    {formatDate(event.expectedDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}