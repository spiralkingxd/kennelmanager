import { Users, Plus } from 'lucide-react';

interface WaitlistEmptyStateProps {
  onAddFirst: () => void;
}

export function WaitlistEmptyState({ onAddFirst }: WaitlistEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Users size={40} className="text-zinc-700" />
      <p className="text-zinc-500 text-sm">Nenhum registro encontrado</p>
      <button onClick={onAddFirst}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
        <Plus size={16} className="inline mr-1" /> Adicionar primeiro
      </button>
    </div>
  );
}
