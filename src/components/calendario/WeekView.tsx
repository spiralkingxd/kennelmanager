import { format, startOfWeek, endOfWeek, isToday, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import type { CalendarEvent } from './types';
import { CATEGORY_STYLES } from './constants';

// ─── WeekView ────────────────────────────────────────────────────────────────

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  activeFilters: Record<string, boolean>;
  onOpenCreateModal: (date: Date) => void;
  onOpenViewModal: (event: CalendarEvent) => void;
}

export function WeekView({ currentDate, events, activeFilters, onOpenCreateModal, onOpenViewModal }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 animate-in fade-in duration-300">
      <div className="grid grid-cols-7 border-b border-zinc-800">
        {days.map((day, i) => {
          const isToday_ = isToday(day);
          const dayEvents = events.filter(
            e => activeFilters[e.category] && e.date && isSameDay(new Date(e.date), day)
          );
          return (
            <div
              key={i}
              className={`p-3 border-r border-zinc-800 last:border-r-0 cursor-pointer hover:bg-zinc-800/30 transition-colors ${isToday_ ? 'bg-brand-500/5' : ''}`}
              onClick={() => onOpenCreateModal(day)}
            >
              <div className="text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{dayLabels[i]}</div>
                <div className={`text-lg font-bold mt-0.5 ${isToday_ ? 'text-brand-400' : 'text-zinc-300'}`}>
                  {format(day, 'd')}
                </div>
                <div className="text-[10px] text-zinc-500 font-semibold">{format(day, 'MMM')}</div>
              </div>
              {dayEvents.length > 0 && (
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded-full">
                    {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayEvents = events.filter(
            e => activeFilters[e.category] && e.date && isSameDay(new Date(e.date), day)
          );
          return (
            <div key={i} className="p-2 border-r border-b border-zinc-800 last:border-r-0 min-h-[160px]">
              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
                {dayEvents.length === 0 ? (
                  <div className="text-[10px] text-zinc-600 text-center py-6">Nenhum evento</div>
                ) : (
                  dayEvents.slice(0, 5).map(event => {
                    const style = CATEGORY_STYLES[event.category];
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onOpenViewModal(event); }}
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors ${style.bg} ${style.color} hover:brightness-125 border ${style.border}`}
                        title={event.title}
                      >
                        {event.time && <span className="mr-1 opacity-75">{event.time}</span>}
                        <span className="truncate block">{event.title}</span>
                      </div>
                    );
                  })
                )}
                {dayEvents.length > 5 && (
                  <div className="text-[10px] text-zinc-500 text-center font-semibold">+{dayEvents.length - 5} mais</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
