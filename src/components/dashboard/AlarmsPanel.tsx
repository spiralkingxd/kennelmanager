import { Bell, Syringe, HeartPulse, DollarSign, Dog, CheckCircle2 } from 'lucide-react';

interface AlarmItem {
  id: string;
  category: string;
  title: string;
  desc: string;
}

interface AlarmsPanelProps {
  alarms: AlarmItem[];
}

export function AlarmsPanel({ alarms }: AlarmsPanelProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-800/20 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Bell size={18} className="text-amber-500" />
          Atenção e Prioridades
        </h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-500 border border-red-500/30">
          {alarms.length}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {alarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <CheckCircle2 size={32} className="text-emerald-600" />
            <p className="text-sm text-zinc-500">Tudo em dia!</p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className="group relative flex gap-3 p-3 bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors rounded-xl border border-zinc-800/80 items-start"
            >
              <div
                className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                  alarm.category === 'saude'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : alarm.category === 'reproducao'
                      ? 'bg-purple-500/10 text-purple-500'
                      : alarm.category === 'financeiro'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-brand-500/10 text-brand-500'
                }`}
              >
                {alarm.category === 'saude' && <Syringe size={16} />}
                {alarm.category === 'reproducao' && <HeartPulse size={16} />}
                {alarm.category === 'financeiro' && <DollarSign size={16} />}
                {alarm.category === 'vendas' && <Dog size={16} />}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-sm font-bold text-zinc-200 truncate">{alarm.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{alarm.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
