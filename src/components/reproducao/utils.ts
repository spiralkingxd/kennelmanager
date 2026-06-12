import type { HeatCycle, Mating, Gestation } from './types';

// ─── Helper Functions ───────────────────────────────────────────────────────────

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Em Cio': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'Coberta': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'Gestante': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Amamentando': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Sem Atividade': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
  }
};

export const getStatusProgressColor = (status: string): string => {
  switch (status) {
    case 'Em Cio': return 'bg-pink-500';
    case 'Gestante': return 'bg-purple-500';
    case 'Amamentando': return 'bg-blue-500';
    default: return 'bg-zinc-700';
  }
};

// ─── Calculate Reproductive Status ────────────────────────────────────────────
export function calculateReproductiveStatus(
  heatCycles: HeatCycle[],
  matings: Mating[],
  gestations: Gestation[]
): { status: string; statusDays: number; progress: number; nextEvent: string; nextDate: string | null } {
  const now = new Date();

  // 1. Check for ACTIVE gestation (pregnant)
  const activeGestation = gestations.find(g => g.is_active && !g.actual_birth_date);
  if (activeGestation) {
    const startDate = new Date(activeGestation.start_date);
    const daysPregnant = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.round((daysPregnant / 63) * 100), 100); // 63 days gestation
    
    const nextEvent = 'Parto Previsto';
    const nextDate = activeGestation.expected_birth_date;
    
    return {
      status: 'Gestante',
      statusDays: daysPregnant,
      progress,
      nextEvent,
      nextDate,
    };
  }

  // 2. Check for recent mating without confirmed pregnancy
  const recentMating = matings.find(m => {
    if (!m.result || m.result === 'PENDING') {
      const matingDate = new Date(m.date);
      const daysSinceMating = Math.floor((now.getTime() - matingDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceMating < 30; // Within 30 days after mating
    }
    return false;
  });
  if (recentMating) {
    const matingDate = new Date(recentMating.date);
    const daysSince = Math.floor((now.getTime() - matingDate.getTime()) / (1000 * 60 * 60 * 24));
    const confirmDate = new Date(matingDate.getTime() + 28 * 24 * 60 * 60 * 1000);

    return {
      status: 'Coberta',
      statusDays: daysSince,
      progress: Math.min(Math.round((daysSince / 30) * 100), 100),
      nextEvent: 'Confirmar Gestação',
      nextDate: confirmDate.toISOString().slice(0, 10),
    };
  }

  // 3. Check for ongoing heat cycle
  const activeHeatCycle = heatCycles.find(h => {
    if (!h.end_date) return true; // No end date = currently in heat
    const endDate = new Date(h.end_date);
    return endDate >= now;
  });
  if (activeHeatCycle) {
    const startDate = new Date(activeHeatCycle.start_date);
    const daysInHeat = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      status: 'Em Cio',
      statusDays: daysInHeat,
      progress: 50,
      nextEvent: 'Cobertura',
      nextDate: null,
    };
  }

  // 4. Check for recently ended heat cycle (potential mating window)
  const lastHeatCycle = heatCycles[0]; // Already sorted by date DESC
  if (lastHeatCycle) {
    const endDate = lastHeatCycle.end_date ? new Date(lastHeatCycle.end_date) : new Date(lastHeatCycle.start_date);
    const daysSinceHeat = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceHeat < 15 && !lastHeatCycle.was_mated) {
      return {
        status: 'Pós-Cio',
        statusDays: daysSinceHeat,
        progress: Math.max(100 - (daysSinceHeat * 7), 0),
        nextEvent: 'Cobertura',
        nextDate: null,
      };
    }
  }

  // 5. Check for nursing period (recent birth within ~60 days)
  const nursingGestation = gestations.find(g => {
    if (!g.actual_birth_date) return false;
    const birthDate = new Date(g.actual_birth_date);
    const daysSinceBirth = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceBirth <= 35;
  });
  if (nursingGestation) {
    const birthDate = new Date(nursingGestation.actual_birth_date!);
    const daysSinceBirth = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const endRestDate = new Date(birthDate.getTime() + 35 * 24 * 60 * 60 * 1000);

    return {
      status: 'Amamentando',
      statusDays: daysSinceBirth,
      progress: Math.min(Math.round((daysSinceBirth / 35) * 100), 100),
      nextEvent: 'Fim do Repouso',
      nextDate: endRestDate.toISOString().slice(0, 10),
    };
  }

  // 6. Default: Sem Atividade - no active cycle, mating, or pregnancy
  return {
    status: 'Sem Atividade',
    statusDays: 0,
    progress: 0,
    nextEvent: 'Próximo Cio',
    nextDate: null,
  };
}
