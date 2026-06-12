export const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Pago' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const SALE_STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Reservado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const SALE_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Concluído', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PENDING: { label: 'Reservado', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  CANCELLED: { label: 'Cancelado', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export const CONDITION_LABELS: Record<string, string> = {
  CASH: 'À Vista',
  ENTRY_PLUS_BALANCE: 'Entrada + Saldo',
  INSTALLMENTS: 'Parcelado',
};

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#10b981', VET: '#3b82f6', VACCINES: '#8b5cf6', EXAMS: '#f59e0b',
  MEDICATION: '#ec4899', REPRODUCTION: '#f97316', EXHIBITION: '#06b6d4',
  INFRASTRUCTURE: '#64748b', MARKETING: '#84cc16', LABOR: '#a855f7', OTHER: '#71717a',
};

export const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Alimentação', VET: 'Veterinário', VACCINES: 'Vacinas',
  EXAMS: 'Exames', MEDICATION: 'Medicamentos', REPRODUCTION: 'Reprodução',
  EXHIBITION: 'Exposição', INFRASTRUCTURE: 'Infraestrutura',
  MARKETING: 'Marketing', LABOR: 'Mão de Obra', OTHER: 'Outro',
};

export const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const statusLabels: Record<string, string> = { ACTIVE: 'Ativo', INACTIVE: 'Inativo', DECEASED: 'Falecido', SOLD: 'Vendido' };

export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Disponível', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  RESERVED: { label: 'Reservado', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  SOLD: { label: 'Vendido', className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  RETAINED: { label: 'Retido', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
};

export const SEX_LABEL: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};

export const FINANCE_STATUS_MAP: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Pago', className: 'bg-emerald-500/10 text-emerald-400' },
  PENDING: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-500' },
  CANCELLED: { label: 'Cancelado', className: 'bg-zinc-800 text-zinc-400' },
};

export function getStatusBadge(status: string): { className: string; label: string } {
  return FINANCE_STATUS_MAP[status] || FINANCE_STATUS_MAP.CANCELLED;
}

export const WAITLIST_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  MATCHED: 'Match',
  COMPLETED: 'Concluído',
  EXPIRED: 'Expirado',
  CANCELED: 'Cancelado',
};

export const WAITLIST_STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-blue-500/10 text-blue-400',
  MATCHED: 'bg-emerald-500/10 text-emerald-400',
  COMPLETED: 'bg-zinc-500/10 text-zinc-400',
  EXPIRED: 'bg-amber-500/10 text-amber-400',
  CANCELED: 'bg-red-500/10 text-red-400',
};
