import { Plus } from 'lucide-react';

interface WaitlistHeaderProps {
  onNew: () => void;
}

export function WaitlistHeader({ onNew }: WaitlistHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Lista de Espera Inteligente</h2>
        <p className="text-sm text-zinc-500">Cruze automaticamente clientes esperando com filhotes nascidos.</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onNew}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all">
          <Plus size={18} /> Novo na Lista
        </button>
      </div>
    </div>
  );
}
