export const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function previousMonthKey(): string {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

export function calcChange(
  current: number,
  previous: number
): { change: string; percent: string; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0 && current === 0) return { change: '-', percent: '-', trend: 'neutral' };
  if (previous === 0) return { change: `+${formatCurrency(current)}`, percent: 'NOVO', trend: 'up' };
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const absPct = Math.abs(pct);
  return {
    change: `${diff >= 0 ? '+' : ''}${formatCurrency(diff)}`,
    percent: `${pct >= 0 ? '+' : ''}${absPct}%`,
    trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
  };
}
