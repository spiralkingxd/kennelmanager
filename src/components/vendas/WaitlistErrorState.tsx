import { AlertTriangle } from 'lucide-react';

interface WaitlistErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function WaitlistErrorState({ error, onRetry }: WaitlistErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertTriangle size={32} className="text-red-400" />
      </div>
      <p className="text-zinc-400 text-sm">{error}</p>
      <button onClick={onRetry}
        className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
        Tentar novamente
      </button>
    </div>
  );
}
