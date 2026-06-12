import { Baby, Dog } from 'lucide-react';

interface PuppyCard {
  id: string;
  code: string;
  status: string;
  sexLabel: string;
  age: string;
  color: string;
}

interface PuppiesStatusProps {
  puppies: PuppyCard[];
  puppiesAvailable: number;
}

export function PuppiesStatus({ puppies, puppiesAvailable }: PuppiesStatusProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Baby size={18} className="text-brand-500" /> Disponibilidade
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {puppiesAvailable} disponíveis • {puppies.length - puppiesAvailable} reservados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {puppies.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-8 text-zinc-500 text-sm">
            Nenhum filhote ativo no momento
          </div>
        ) : (
          puppies.map((puppy) => (
            <div
              key={puppy.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-800/30 p-3 hover:bg-zinc-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${puppy.color}`}>{puppy.status}</span>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  {puppy.age}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center">
                  <Dog size={20} className="text-zinc-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200 group-hover:text-brand-400 transition-colors">
                    {puppy.code}
                  </p>
                  <p className="text-xs text-zinc-500">{puppy.sexLabel}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
