import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dog, User } from 'lucide-react';
import type { CalendarEvent } from './types';
import { CATEGORY_LABELS, CATEGORY_STYLES } from './constants';

// ─── ListView ────────────────────────────────────────────────────────────────

interface ListViewProps {
  events: CalendarEvent[];
  activeFilters: Record<string, boolean>;
  onOpenViewModal: (event: CalendarEvent) => void;
}

export function ListView({ events, activeFilters, onOpenViewModal }: ListViewProps) {
  const filteredEvents = events
    .filter(e => activeFilters[e.category])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">Nenhum evento para exibir nos filtros atuais.</div>
        ) : (
          filteredEvents.map(event => {
            const style = CATEGORY_STYLES[event.category];
            const Icon = style.icon;
            const statusColor = event.status === 'COMPLETED' ? 'text-green-400' : event.status === 'CANCELED' ? 'text-red-400' : 'text-zinc-500';
            return (
              <div key={event.id} onClick={() => onOpenViewModal(event)} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-800/80 bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors cursor-pointer group">
                <div className={`mt-1 p-2 rounded-xl border ${style.bg} ${style.border} ${style.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-lg flex items-center gap-2 group-hover:text-brand-400 transition-colors">
                        {event.title}
                        {event.is_automatic && <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Automático</span>}
                      </h4>
                      <div className="text-sm font-semibold text-zinc-400 mt-1 capitalize">
                        {format(new Date(event.date), "EEEE, dd 'de' MMMM", { locale: ptBR })} {event.time && `- ${event.time}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase ${statusColor}`}>{event.status}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${style.bg} ${style.color} border ${style.border}`}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                    </div>
                  </div>
                  
                  {(event.animal_name || event.client_name) && (
                    <div className="flex gap-4 mt-3 text-sm text-zinc-400 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50">
                       {event.animal_name && <span className="flex items-center gap-1.5"><Dog size={14} className="text-zinc-500"/> {event.animal_name}</span>}
                       {event.client_name && <span className="flex items-center gap-1.5"><User size={14} className="text-zinc-500"/> {event.client_name}</span>}
                    </div>
                  )}
                  {event.description && (
                    <p className="text-sm text-zinc-400 mt-3">{event.description}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
