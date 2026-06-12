import React from 'react';
import { Dog, Edit3, Trash2, Baby } from 'lucide-react';
import { PUPPY_BADGE_COLORS, PUPPY_STATUS_LABELS } from './NinhadaProfile.constants';

interface PuppyListCardProps {
  puppies: any[];
  onEditPuppy: (puppy: any) => void;
  onDeletePuppy: (puppyId: string, puppyName: string) => void;
}

export function PuppyListCard({ puppies, onEditPuppy, onDeletePuppy }: PuppyListCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
       <div className="mb-6">
          <h3 className="text-lg font-bold text-white">Filhotes ({puppies.length})</h3>
       </div>

       {puppies.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {puppies.map(pup => (
              <div key={pup.id} className="flex flex-col gap-2 rounded-xl bg-zinc-800/30 p-4 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${pup.sex === 'MALE' ? 'bg-blue-900/20 border-blue-900/50 text-blue-500' : 'bg-pink-900/20 border-pink-900/50 text-pink-500'}`}>
                        <Dog size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-100">{(pup.name || pup.color || 'Filhote')} - {pup.sex === 'MALE' ? 'Macho' : 'Fêmea'}</h4>
                        <span className="text-xs text-zinc-500">{pup.color || '-'} • {pup.weight ? `${pup.weight} kg` : '-'}</span>
                      </div>
                   </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditPuppy(pup)}
                      className="flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      <Edit3 size={12} />
                      Editar
                    </button>
                    <button
                      onClick={() => onDeletePuppy(pup.id, pup.name)}
                      className="flex items-center gap-1 rounded-md bg-red-900/20 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={12} />
                      Excluir
                    </button>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold tracking-wider border ${PUPPY_BADGE_COLORS[pup.status] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {PUPPY_STATUS_LABELS[pup.status] || pup.status}
                  </span>
                </div>
              </div>
            ))}
         </div>
       ) : (
         <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
            <Baby size={32} className="mb-2 text-zinc-700" />
            <p>Nenhum filhote registrado ainda.</p>
         </div>
       )}
    </div>
  );
}
