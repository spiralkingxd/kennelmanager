import { TimelineStep } from './NinhadaProfile.types';

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

export function generateTimeline(litter: any): TimelineStep[] {
  const steps: TimelineStep[] = [];
  const statusOrder = ['PLANNED', 'CONFIRMED', 'BORN', 'WEANING', 'COMPLETED'];
  const currentIdx = statusOrder.indexOf(litter?.status);

  if (litter?.mating_date) {
    steps.push({
      event: 'Cobertura',
      date: formatDate(litter.mating_date),
      done: true,
    });
  }

  steps.push({
    event: 'Gestação Confirmada',
    date: litter?.expected_date ? formatDate(litter.expected_date) : '-',
    done: currentIdx >= 1,
  });

  if (litter?.birth_date) {
    steps.push({
      event: 'Nascimento',
      date: formatDate(litter.birth_date),
      done: currentIdx >= 2,
    });
  } else {
    steps.push({
      event: 'Nascimento',
      date: '-',
      done: false,
    });
  }

  steps.push({
    event: 'Desmame',
    date: currentIdx >= 3 && litter?.birth_date
      ? formatDate(new Date(new Date(litter.birth_date).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString())
      : '-',
    done: currentIdx >= 3,
  });

  steps.push({
    event: 'Concluída',
    date: currentIdx >= 4 ? formatDate(litter?.created_at) : '-',
    done: currentIdx >= 4,
  });

  return steps;
}
