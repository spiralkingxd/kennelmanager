import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, CalendarDays, Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ─── CalendarHeader ──────────────────────────────────────────────────────────

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'list';
  onViewModeChange: (mode: 'month' | 'week' | 'list') => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  onNewEvent: () => void;
}

export function CalendarHeader({
  currentDate, viewMode, onViewModeChange,
  onPrevMonth, onNextMonth, onGoToToday, onNewEvent,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-1 border border-zinc-700/50 rounded-lg p-1 bg-zinc-900/50">
          <button onClick={onPrevMonth} className="px-2 py-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={onGoToToday} className="px-3 py-1 text-sm font-semibold text-zinc-300 hover:text-white rounded hover:bg-zinc-800 transition-colors">
            Hoje
          </button>
          <button onClick={onNextMonth} className="px-2 py-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex p-1 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
          <button 
            onClick={() => onViewModeChange('month')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${viewMode === 'month' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            <CalendarIcon size={14} /> Mês
          </button>
          <button 
            onClick={() => onViewModeChange('week')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${viewMode === 'week' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            <CalendarDays size={14} /> Semana
          </button>
          <button 
            onClick={() => onViewModeChange('list')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
          >
            <List size={14} /> Agenda
          </button>
        </div>
        
        <button className="flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 text-xs font-semibold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-all">
          <Download size={14} /> Exportar
        </button>
        <button 
          onClick={onNewEvent}
          className="flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
        >
          <Plus size={14} /> Novo Evento
        </button>
      </div>
    </div>
  );
}
