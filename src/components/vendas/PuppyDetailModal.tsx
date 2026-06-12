import { Dog, X, Tag, DollarSign, User, Calendar } from 'lucide-react';
import { STATUS_MAP } from './constants';
import type { Puppy } from './types';

interface PuppyDetailModalProps {
  puppy: Puppy;
  onClose: () => void;
}

export function PuppyDetailModal({ puppy: detailPuppy, onClose }: PuppyDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95">

        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
              detailPuppy.sex === 'MALE' ? 'bg-blue-900/20 border-blue-900/50 text-blue-500' : 'bg-pink-900/20 border-pink-900/50 text-pink-500'
            }`}>
              <Dog size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{detailPuppy.name || detailPuppy.color || 'Filhote sem nome'}</h2>
              <p className="text-xs text-zinc-500">
                {detailPuppy.sex === 'MALE' ? 'Macho' : 'Fêmea'} • {detailPuppy.color || 'Cor não informada'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</span>
            <span className={`px-3 py-1 rounded text-xs font-bold tracking-wider border ${
              STATUS_MAP[detailPuppy.status]?.className || 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}>
              {STATUS_MAP[detailPuppy.status]?.label || detailPuppy.status}
            </span>
          </div>

          {detailPuppy.litter_id && (
            <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} /> Ninhada
              </h3>
              <p className="text-sm font-medium text-zinc-200">
                {detailPuppy.mother_name || 'Mãe: —'} & {detailPuppy.father_name || 'Pai: —'}
              </p>
              {detailPuppy.breed && (
                <p className="text-xs text-zinc-500">Raça: {detailPuppy.breed}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Dog size={14} /> Sexo
              </span>
              <span className="text-sm font-medium text-zinc-200">{detailPuppy.sex === 'MALE' ? 'Macho' : 'Fêmea'}</span>
            </div>
            <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Dog size={14} /> Cor
              </span>
              <span className="text-sm font-medium text-zinc-200">{detailPuppy.color || '—'}</span>
            </div>
            {detailPuppy.weight && (
              <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Dog size={14} /> Peso
                </span>
                <span className="text-sm font-medium text-zinc-200">{detailPuppy.weight} kg</span>
              </div>
            )}
            {detailPuppy.microchip && (
              <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Dog size={14} /> Microchip
                </span>
                <span className="text-sm font-medium text-zinc-200">{detailPuppy.microchip}</span>
              </div>
            )}
            {detailPuppy.registration_number && (
              <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Dog size={14} /> Registro
                </span>
                <span className="text-sm font-medium text-zinc-200">{detailPuppy.registration_number}</span>
              </div>
            )}
          </div>

          {detailPuppy.price && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <span className="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider flex items-center gap-2 mb-2">
                <DollarSign size={14} /> Preço
              </span>
              <span className="text-lg font-bold text-emerald-400">
                R$ {Number(detailPuppy.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {detailPuppy.client_name && (detailPuppy.status === 'RESERVED' || detailPuppy.status === 'SOLD') && (
            <div className="rounded-xl bg-zinc-800/30 border border-zinc-800 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Comprador
              </h3>
              <p className="text-sm font-medium text-zinc-200">{detailPuppy.client_name}</p>
              {detailPuppy.sale_date && (
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <Calendar size={12} /> Venda em {new Date(detailPuppy.sale_date).toLocaleDateString('pt-BR')}
                </p>
              )}
              {detailPuppy.sale_notes && (
                <p className="text-xs text-zinc-400 italic">{detailPuppy.sale_notes}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
