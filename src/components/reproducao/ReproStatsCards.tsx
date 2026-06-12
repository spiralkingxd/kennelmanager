import { Dog, Heart, Activity, Baby, CheckCircle2, Milk } from 'lucide-react';

// ─── ReproStatsCards ──────────────────────────────────────────────────────────

interface ReproStatsCardsProps {
  stats: {
    total: number;
    inHeat: number;
    mated: number;
    pregnant: number;
    nursing: number;
    resting: number;
  };
}

export function ReproStatsCards({ stats }: ReproStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Matrizes</span>
          <Dog size={16} className="text-brand-500" />
        </div>
        <p className="text-xl font-bold text-white">{stats.total}</p>
      </div>

      <div className="rounded-2xl border border-pink-500/20 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Em Cio</span>
          <Heart size={16} className="text-pink-500" />
        </div>
        <p className="text-xl font-bold text-pink-400">{stats.inHeat}</p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Coberta</span>
          <Activity size={16} className="text-amber-500" />
        </div>
        <p className="text-xl font-bold text-amber-400">{stats.mated}</p>
      </div>

      <div className="rounded-2xl border border-purple-500/20 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Gestante</span>
          <Baby size={16} className="text-purple-500" />
        </div>
        <p className="text-xl font-bold text-purple-400">{stats.pregnant}</p>
      </div>

      <div className="rounded-2xl border border-blue-500/20 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Amamentando</span>
          <Milk size={16} className="text-blue-500" />
        </div>
        <p className="text-xl font-bold text-blue-400">{stats.nursing}</p>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sem Atividade</span>
          <CheckCircle2 size={16} className="text-emerald-500" />
        </div>
        <p className="text-xl font-bold text-emerald-400">{stats.resting}</p>
      </div>
    </div>
  );
}
