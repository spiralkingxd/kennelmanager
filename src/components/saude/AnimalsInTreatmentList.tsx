import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  breed: string;
  photo_url: string | null;
}

interface AnimalsInTreatmentListProps {
  animals: Animal[];
}

export function AnimalsInTreatmentList({ animals }: AnimalsInTreatmentListProps) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-zinc-900/40 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50"></div>
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500" />
          Em Tratamento
        </h2>
        <span className="text-xs text-zinc-500">{animals.length}</span>
      </div>

      {animals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={32} className="text-emerald-500/50 mb-2" />
          <p className="text-xs text-zinc-500">Nenhum animal em tratamento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {animals.map((animal) => (
            <div key={animal.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-zinc-300 text-xs font-bold uppercase">
                {animal.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{animal.name}</p>
                <p className="text-xs text-zinc-500 truncate">{animal.breed}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}