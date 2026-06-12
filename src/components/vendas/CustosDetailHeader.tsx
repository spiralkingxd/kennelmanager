import { ArrowLeft } from 'lucide-react';

interface CustosDetailHeaderProps {
  name: string;
  breed: string | null;
  transactions: number;
  onBack: () => void;
}

export function CustosDetailHeader({ name, breed, transactions, onBack }: CustosDetailHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <button onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
        <ArrowLeft size={18} />
      </button>
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">{name}</h2>
          {breed && <span className="text-xs text-zinc-500">{breed}</span>}
        </div>
        <p className="text-sm text-zinc-500">{transactions} transações financeiras</p>
      </div>
    </div>
  );
}
