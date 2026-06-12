import { type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  change: string;
  percent: string;
  trend: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: string;
}

export function KpiCard({ title, value, change, percent, trend, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className="text-xs font-semibold text-zinc-400">{title}</span>
        <div className={`p-1.5 rounded-lg bg-zinc-800/80 ${color} border border-zinc-700/50`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-black text-white mb-2 tracking-tight relative z-10">{value}</div>
      <div className="flex items-center gap-1.5 mt-auto relative z-10">
        {change !== '-' ? (
          <>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : trend === 'down'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {percent}
            </span>
            <span className="text-[10px] text-zinc-500">vs. mês anterior</span>
          </>
        ) : (
          <span className="text-[10px] text-zinc-500">Dados do mês</span>
        )}
      </div>
    </div>
  );
}
