import { Calendar as CalendarIcon } from 'lucide-react';

interface AgendaEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
}

interface AgendaPanelProps {
  events: AgendaEvent[];
  navigateTo?: (id: string) => void;
}

export function AgendaPanel({ events, navigateTo }: AgendaPanelProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
      <h3 className="font-bold text-white flex items-center gap-2 mb-4">
        <CalendarIcon size={18} className="text-blue-500" /> Agenda Próx. 7 Dias
      </h3>

      <div className="space-y-3 flex-1">
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhum evento na agenda</p>
        ) : (
          events.slice(0, 5).map((evt) => (
            <div
              key={evt.id}
              className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-700 shrink-0">
                {new Date(evt.date).getDate()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-zinc-200 truncate">{evt.title}</p>
                <p className="text-xs text-zinc-500 truncate">{evt.description || ''}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigateTo?.('calendario')}
        className="mt-5 w-full text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 py-2 rounded-lg hover:bg-zinc-800"
      >
        Abrir Calendário Completo
      </button>
    </div>
  );
}
