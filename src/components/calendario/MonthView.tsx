import type { ReactNode } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday } from 'date-fns';
import type { CalendarEvent } from './types';
import { CATEGORY_STYLES } from './constants';

// ─── MonthView ───────────────────────────────────────────────────────────────

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  activeFilters: Record<string, boolean>;
  onOpenCreateModal: (date: Date) => void;
  onOpenViewModal: (event: CalendarEvent) => void;
}

function DaysOfWeek() {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return (
    <div className="grid grid-cols-7 mb-2">
      {days.map((label, i) => (
        <div key={i} className="text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </div>
      ))}
    </div>
  );
}

export function MonthView({ currentDate, events, activeFilters, onOpenCreateModal, onOpenViewModal }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows: ReactNode[] = [];
  let days: ReactNode[] = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const dayEvents = events.filter(e => activeFilters[e.category] && e.date && isSameDay(new Date(e.date), cloneDay));
      const cloneKey = day.toISOString();

      days.push(
        <div
          className={`min-h-[120px] p-2 border-r border-b border-zinc-800 relative group cursor-pointer transition-colors ${
            !isSameMonth(day, monthStart) ? 'bg-zinc-900/20 text-zinc-600' : 
            isToday(day) ? 'bg-brand-500/5 text-zinc-200' : 'bg-transparent text-zinc-300 hover:bg-zinc-800/30'
          }`}
          key={cloneKey}
          onClick={() => onOpenCreateModal(cloneDay)}
        >
          <span className={`text-sm font-semibold mb-2 block ${isToday(day) ? 'text-brand-400 bg-brand-500/10 w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
            {format(day, 'd')}
          </span>
          
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[85px] scrollbar-none">
            {dayEvents.slice(0, 3).map(event => {
              const style = CATEGORY_STYLES[event.category];
              return (
                <div 
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onOpenViewModal(event); }}
                  className={`px-1.5 py-1 text-[10px] sm:text-xs font-semibold rounded truncate transition-colors ${style.bg} ${style.color} hover:brightness-125 border ${style.border}`}
                  title={event.title}
                >
                  {event.time && <span className="mr-1 opacity-75">{event.time}</span>}
                  {event.title}
                </div>
              );
            })}
          </div>
          
          {dayEvents.length > 3 && (
            <div className="absolute bottom-1 right-2 text-[10px] text-zinc-500 font-semibold group-hover:text-zinc-300">
              +{dayEvents.length - 3} mais
            </div>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-300">
      <DaysOfWeek />
      <div className="flex flex-col border-l border-t border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40">
        {rows}
      </div>
    </div>
  );
}
