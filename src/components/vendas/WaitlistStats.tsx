import { Users } from 'lucide-react';

interface WaitlistStatsProps {
  total: number;
  activeCount: number;
  matchedCount: number;
}

export function WaitlistStats({ total, activeCount, matchedCount }: WaitlistStatsProps) {
  return (
    <div className="flex gap-4 text-sm">
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-2.5">
        <Users size={16} className="text-brand-500" />
        <span className="text-zinc-400">Total: <strong className="text-zinc-200">{total}</strong></span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-2.5">
        <div className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="text-zinc-400">Ativos: <strong className="text-blue-400">{activeCount}</strong></span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-2.5">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-zinc-400">Matches: <strong className="text-emerald-400">{matchedCount}</strong></span>
      </div>
    </div>
  );
}
