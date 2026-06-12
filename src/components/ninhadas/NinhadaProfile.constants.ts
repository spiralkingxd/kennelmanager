export const STATUS_LABELS: Record<string, string> = {
  PLANNED: 'Planejada',
  CONFIRMED: 'Confirmada',
  BORN: 'Nascida',
  WEANING: 'Desmame',
  COMPLETED: 'Concluída',
  CANCELED: 'Cancelada',
};

export const PUPPY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  RETAINED: 'Retido',
};

export const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  BORN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  WEANING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  COMPLETED: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  CANCELED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const PUPPY_BADGE_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  RESERVED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  SOLD: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  RETAINED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};
