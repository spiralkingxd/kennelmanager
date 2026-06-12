import { HeartPulse } from 'lucide-react';

interface LitterItem {
  id: string;
  mother_name?: string;
  puppy_count?: number;
  birth_date?: string;
}

interface ReproductionStatusProps {
  femalesCount: number;
  littersActive: number;
  littersRecent: LitterItem[];
  navigateTo?: (id: string) => void;
}

export function ReproductionStatus({ femalesCount, littersActive, littersRecent, navigateTo }: ReproductionStatusProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
      <h3 className="font-bold text-white flex items-center gap-2 mb-4">
        <HeartPulse size={18} className="text-rose-500" /> Situação Reprodutiva
      </h3>
      <div className="space-y-3 flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Fêmeas no Plantel</p>
            <p className="text-lg font-bold text-white">{femalesCount}</p>
          </div>
          <div className="bg-zinc-800/40 p-3 rounded-xl border border-zinc-800">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Ninhadas Ativas</p>
            <p className="text-lg font-bold text-purple-400">{littersActive}</p>
          </div>
        </div>

        {littersRecent.length > 0 && (
          <div className="bg-zinc-800/20 p-3 rounded-xl border border-zinc-800/60">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Últimas Ninhadas (60 dias)</p>
            <div className="space-y-1.5">
              {littersRecent.map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium truncate">
                    {l.mother_name || 'Matriz'} {l.puppy_count ? `• ${l.puppy_count} filhotes` : ''}
                  </span>
                  <span className="text-zinc-500 shrink-0 ml-2">
                    {l.birth_date ? new Date(l.birth_date).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {littersRecent.length === 0 && littersActive === 0 && (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhuma atividade reprodutiva no momento</p>
        )}
      </div>

      <button
        onClick={() => navigateTo?.('reproducao')}
        className="mt-4 w-full text-center text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors bg-zinc-800/50 py-2 rounded-lg hover:bg-zinc-800"
      >
        Abrir Controle Reprodutivo
      </button>
    </div>
  );
}
