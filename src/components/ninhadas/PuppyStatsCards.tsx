import React from 'react';

interface PuppyStatsCardsProps {
  total: number;
  available: number;
  reserved: number;
  sold: number;
}

export function PuppyStatsCards({ total, available, reserved, sold }: PuppyStatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded-xl bg-zinc-900/40 p-4 border border-zinc-800 flex flex-col items-center">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total</span>
        <span className="text-xl font-bold text-white">{total}</span>
      </div>
      <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20 flex flex-col items-center">
        <span className="text-xs text-emerald-500/80 uppercase tracking-wider font-semibold mb-1">Disponíveis</span>
        <span className="text-xl font-bold text-emerald-400">{available}</span>
      </div>
      <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20 flex flex-col items-center">
        <span className="text-xs text-amber-500/80 uppercase tracking-wider font-semibold mb-1">Reservados</span>
        <span className="text-xl font-bold text-amber-400">{reserved}</span>
      </div>
      <div className="rounded-xl bg-zinc-800 p-4 border border-zinc-700 flex flex-col items-center">
        <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Vendidos</span>
        <span className="text-xl font-bold text-zinc-300">{sold}</span>
      </div>
    </div>
  );
}
