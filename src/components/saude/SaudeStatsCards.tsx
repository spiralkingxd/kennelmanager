import { Dog, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface Statistics {
  totalAnimals: number;
  criticalAlerts: number;
  pendingTreatments: number;
  healthyPercentage: number;
}

interface SaudeStatsCardsProps {
  stats?: Statistics;
}

export function SaudeStatsCards({ stats }: SaudeStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Animais</span>
          <Dog size={18} className="text-brand-500" />
        </div>
        <p className="text-2xl font-bold text-white">{stats?.totalAnimals ?? 0}</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Saudáveis</span>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-white">{stats?.healthyPercentage ?? 100}%</p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Em Tratamento</span>
          <AlertTriangle size={18} className="text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-white">{stats?.pendingTreatments ?? 0}</p>
      </div>

      <div className="rounded-2xl border border-red-500/20 bg-zinc-900/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Alertas Críticos</span>
          <AlertCircle size={18} className="text-red-500" />
        </div>
        <p className="text-2xl font-bold text-white">{stats?.criticalAlerts ?? 0}</p>
      </div>
    </div>
  );
}