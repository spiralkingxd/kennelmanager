/**
 * Utilities centralizadas para formatação de datas no padrão DD/MM/YYYY.
 *
 * O banco de dados e a API sempre usam ISO (YYYY-MM-DD).
 * O frontend exibe e recebe input em DD/MM/YYYY.
 */

/** "2026-06-04" (ou "2026-06-04T00:00:00.000Z") → "04/06/2026" */
export function formatDateBR(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.slice(0, 10).split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** "04/06/2026" → "2026-06-04" */
export function parseDateBR(brDate: string): string {
  const digits = brDate.replace(/\D/g, '');
  if (digits.length !== 8) return brDate;
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

/** Data de hoje como YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Data de hoje como DD/MM/YYYY */
export function todayBR(): string {
  return formatDateBR(todayISO());
}

/** Valida se uma string DD/MM/YYYY é uma data real */
export function isValidDateBR(brDate: string): boolean {
  const match = brDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const [, d, m, y] = match;
  const date = new Date(+y, +m - 1, +d);
  return date.getDate() === +d && date.getMonth() === +m - 1 && date.getFullYear() === +y;
}
