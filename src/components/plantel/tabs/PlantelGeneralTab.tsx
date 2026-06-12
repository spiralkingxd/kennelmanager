import { useState } from 'react';
import { Dog, Scale, Calendar, MapPin, Hash, FileDigit, Link, BadgeAlert, Edit3 } from 'lucide-react';
import { AnimalEditModal } from '../modals/AnimalEditModal';

export function PlantelGeneralTab({ dog, onDogUpdate }: { dog: any; onDogUpdate?: () => void }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna Principal - Dados Essenciais */}
      <div className="lg:col-span-2 space-y-8">
        
        <section>
           <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
             <Dog size={16} className="text-zinc-500" /> Detalhes Físicos e Origem
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="flex flex-col gap-1">
               <span className="text-xs text-zinc-500">Cor e Marcação</span>
               <span className="text-sm font-medium text-zinc-200">{dog.color}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-xs text-zinc-500">Peso Atual</span>
               <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><Scale size={14} className="text-zinc-500"/> {dog.weight}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-xs text-zinc-500">Porte</span>
               <span className="text-sm font-medium text-zinc-200">{dog.size}</span>
             </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Data de Nascimento</span>
                <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><Calendar size={14} className="text-zinc-500"/> {dog.birth_date ? new Date(dog.birth_date).toLocaleDateString('pt-BR') : 'N/I'}</span>
              </div>
             <div className="flex flex-col gap-1">
               <span className="text-xs text-zinc-500">Origem</span>
               <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><MapPin size={14} className="text-zinc-500"/> {dog.origin}</span>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-xs text-zinc-500">Criador / Canil Origem</span>
               <span className="text-sm font-medium text-zinc-200">{dog.breeder}</span>
             </div>
           </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
             <FileDigit size={16} className="text-zinc-500" /> Registros Oficiais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Nº de Registro (Pedigree)</span>
                <span className="text-sm font-medium text-zinc-200 font-mono tracking-wider">{dog.registration_number || dog.pedigree_number || '—'}</span>
              </div>
             <div className="flex flex-col gap-1">
               <span className="text-xs text-zinc-500">Microchip</span>
               <span className="text-sm font-medium text-zinc-200 font-mono tracking-wider">{dog.microchip}</span>
             </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Data de Aquisição</span>
                <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><Calendar size={14} className="text-zinc-500"/> {dog.purchase_date ? new Date(dog.purchase_date).toLocaleDateString('pt-BR') : '—'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Valor de Aquisição</span>
                <span className="text-sm font-medium text-zinc-200">{dog.purchase_price ? `R$ ${Number(dog.purchase_price).toFixed(2)}` : '—'}</span>
              </div>
          </div>
        </section>

        <section>
           <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
             <BadgeAlert size={16} className="text-zinc-500" /> Temperamento e Observações
           </h3>
           <div className="flex flex-wrap gap-2 mb-4">
               {dog.temperament && Array.isArray(dog.temperament) && dog.temperament.map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 font-medium">
                    {t}
                  </span>
               ))}
           </div>
           
           {dog.notes && (
             <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-4 mt-2">
               <p className="text-sm text-zinc-400 italic">{`"`}{dog.notes}{`"`}</p>
             </div>
           )}
        </section>

      </div>

      {/* Coluna Sidebar - Genealogia */}
      <div className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 self-start">
        <h3 className="mb-6 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
          <Link size={16} className="text-zinc-500" /> Genealogia
        </h3>
        
        <div className="flex flex-col gap-6 relative before:absolute before:left-3.5 before:top-4 before:h-full before:-bottom-4 before:w-px before:bg-zinc-800">
          
          <div className="relative flex gap-4">
             <div className="z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900/30 border border-blue-800 text-blue-500">
                <Dog size={14} />
             </div>
             <div className="flex flex-col pt-1.5 flex-1 min-w-0">
               <span className="text-xs text-zinc-500">Pai (Sire)</span>
                <span className="text-sm font-medium text-zinc-200 truncate pr-2 hover:text-brand-500 cursor-pointer transition-colors w-max">{dog.father_name || 'Desconhecido'}</span>
             </div>
          </div>
          
          <div className="relative flex gap-4">
             <div className="z-10 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-900/30 border border-pink-800 text-pink-500">
                <Dog size={14} />
             </div>
             <div className="flex flex-col pt-1.5 flex-1 min-w-0">
               <span className="text-xs text-zinc-500">Mãe (Dam)</span>
                <span className="text-sm font-medium text-zinc-200 truncate pr-2 hover:text-brand-500 cursor-pointer transition-colors w-max">{dog.mother_name || 'Desconhecida'}</span>
             </div>
          </div>
          
        </div>
        
        <button
          onClick={() => setEditModalOpen(true)}
          className="mt-8 w-full rounded-lg py-2 text-sm font-medium text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          <Edit3 size={16} />
          Editar Ficha
        </button>
      </div>

    </div>

    <AnimalEditModal
      isOpen={editModalOpen}
      onClose={() => setEditModalOpen(false)}
      onSaved={() => { onDogUpdate?.(); }}
      dog={dog}
    />
    </>
  );
}
