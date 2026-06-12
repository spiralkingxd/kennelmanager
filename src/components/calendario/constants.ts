import { Calendar as CalendarIcon, HeartPulse, Activity, Baby, DollarSign, Users, Trophy } from 'lucide-react';
import type { EventCategory, FormState } from './types';

// ─── Constants ───────────────────────────────────────────────────────────────

export const EMPTY_FORM: FormState = {
  title: '', date: '', time: '', endTime: '', category: 'MANUAL',
  description: '', color: '', status: 'PENDING',
  animalId: '', animalName: '', clientId: '', clientName: '',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  HEALTH: 'Saúde', REPRODUCTION: 'Reprodução', LITTER: 'Ninhadas',
  FINANCIAL: 'Financeiro', VISIT: 'Visitas', EXHIBITION: 'Exposições', MANUAL: 'Manual',
};

export const CATEGORY_STYLES: Record<EventCategory, { color: string; bg: string; border: string; icon: any }> = {
  HEALTH: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', icon: HeartPulse },
  REPRODUCTION: { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', icon: Activity },
  LITTER: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Baby },
  FINANCIAL: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: DollarSign },
  VISIT: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: Users },
  EXHIBITION: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Trophy },
  MANUAL: { color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', icon: CalendarIcon },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_STYLES) as EventCategory[];

export const COLOR_OPTIONS = ['', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
