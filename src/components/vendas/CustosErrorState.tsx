import { AlertCircle } from 'lucide-react';

interface CustosErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function CustosErrorState({ error, onRetry }: CustosErrorStateProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={40} className="text-red-500" />
        <p className="text-sm text-zinc-400">{error}</p>
        <button onClick={onRetry} className="h-9 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors">Tentar novamente</button>
      </div>
    </div>
  );
}
