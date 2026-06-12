import { ReactNode } from 'react';
import { Syringe, Pill, Calendar } from 'lucide-react';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString('pt-BR');
  if (diffDays < 0) return `${formatted} (Vencido)`;
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return `Amanhã`;
  if (diffDays <= 7) return `${formatted} (${diffDays} dias)`;
  return formatted;
};

export const getDateStatus = (dateStr: string): string => {
  if (!dateStr) return 'text-zinc-200';
  const diffDays = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'text-red-500';
  if (diffDays <= 3) return 'text-amber-500';
  if (diffDays <= 7) return 'text-yellow-500';
  return 'text-zinc-200';
};

export const getEventIcon = (type: string): ReactNode => {
  switch (type) {
    case 'vaccine': return <Syringe size={16} />;
    case 'deworming': return <Pill size={16} />;
    default: return <Calendar size={16} />;
  }
};

export const getEventColor = (type: string): string => {
  switch (type) {
    case 'vaccine': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'deworming': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
  }
};