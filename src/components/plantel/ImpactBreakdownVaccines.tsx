import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ImpactData } from './AnimalDeleteModal';

type CategoryKey = keyof ImpactData['counts'];

interface CategoryDetailProps {
  key?: string;
  category: CategoryKey;
  items: unknown[];
  count: number;
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  litters: 'Ninhadas (como pai/mãe)',
  matings: 'Coberturas/Inseminações',
  gestations: 'Gestações registradas',
  heat_cycles: 'Ciclos de Cio',
  vaccines: 'Vacinas aplicadas',
  deworming: 'Vermífugos aplicados',
  exams: 'Exames realizados',
  consultations: 'Consultas veterinárias',
  weight_history: 'Registros de Peso',
  medications: 'Medicações em andamento',
  documents: 'Documentos anexados',
  financial_transactions: 'Transações financeiras',
  calendar_events: 'Eventos na agenda',
};

const CATEGORY_COLORS: Record<CategoryKey, string> = {
  litters: 'text-pink-400',
  matings: 'text-purple-400',
  gestations: 'text-amber-400',
  heat_cycles: 'text-rose-400',
  vaccines: 'text-blue-400',
  deworming: 'text-teal-400',
  exams: 'text-cyan-400',
  consultations: 'text-indigo-400',
  weight_history: 'text-emerald-400',
  medications: 'text-orange-400',
  documents: 'text-zinc-400',
  financial_transactions: 'text-green-400',
  calendar_events: 'text-yellow-400',
};

function formatDate(d: string): string {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR');
}

function renderItemLabel(category: CategoryKey, item: unknown): string {
  const i = item as Record<string, unknown>;
  switch (category) {
    case 'vaccines':
      return `${i.name || '(vacina)'} — ${formatDate(i.date as string)}`;
    case 'deworming':
      return `${i.product || '(vermífugo)'} — ${formatDate(i.date as string)}`;
    default:
      return (i.name as string) || (i.title as string) || i.id as string || '(registro)';
  }
}

function CategoryDetail({ category, items, count }: CategoryDetailProps) {
  const [open, setOpen] = useState(false);
  if (count === 0) return null;

  return (
    <div className="border-b border-zinc-800/80 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-zinc-800/30 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          {open ? <ChevronDown size={14} className="text-zinc-500 shrink-0" /> : <ChevronRight size={14} className="text-zinc-500 shrink-0" />}
          <span className={CATEGORY_COLORS[category]}>{CATEGORY_LABELS[category]}</span>
        </span>
        <span className="font-semibold text-zinc-100 ml-2">{count}</span>
      </button>
      {open && items.length > 0 && (
        <div className="px-4 pb-2 space-y-1">
          {items.map((item) => (
            <div key={(item as { id: string }).id} className="flex items-center justify-between rounded bg-zinc-800/20 px-3 py-1.5 text-xs text-zinc-400">
              <span className="truncate mr-2">{renderItemLabel(category, item)}</span>
              <span className="shrink-0 text-zinc-500">{(item as { date?: string; created_at?: string }).date ? formatDate((item as { date: string }).date) : (item as { created_at: string }).created_at ? formatDate((item as { created_at: string }).created_at) : ''}</span>
            </div>
          ))}
          {count > items.length && (
            <p className="text-xs text-zinc-600 px-3 pt-1">
              ...e mais {count - items.length} registro{(count - items.length) !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const CATEGORIES: CategoryKey[] = ['vaccines', 'deworming'];

interface ImpactBreakdownVaccinesProps {
  impact: ImpactData;
}

export function ImpactBreakdownVaccines({ impact }: ImpactBreakdownVaccinesProps) {
  return (
    <>
      {CATEGORIES.map(cat => (
        <CategoryDetail
          key={cat}
          category={cat}
          items={impact.details[cat] as unknown[]}
          count={impact.counts[cat]}
        />
      ))}
    </>
  );
}