import { Dog } from 'lucide-react';
import { STATUS_MAP, SEX_LABEL } from './constants';
import type { Puppy } from './types';

interface PuppyCardProps {
  puppy: Puppy;
  onStatusChange: (puppyId: string, newStatus: string, puppyName: string) => void;
  onReserve: (puppy: Puppy) => void;
  onViewDetail: (puppy: Puppy) => void;
  actionLoading: string | null;
}

export function PuppyCard({ puppy: p, onStatusChange, onReserve, onViewDetail, actionLoading }: PuppyCardProps) {
  const statusInfo = STATUS_MAP[p.status] || { label: p.status, className: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  const litterName = p.mother_name ? `Ninhada de ${p.mother_name}` : (p.litter_id?.slice(0, 8) || '—');

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all">
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
              p.sex === 'MALE' ? 'bg-blue-900/20 border-blue-900/50 text-blue-400' : 'bg-pink-900/20 border-pink-900/50 text-pink-400'
            }`}>
              <Dog size={14} />
            </div>
            <h3 className="font-bold text-lg text-white truncate">{p.name || p.color || 'Sem nome'}</h3>
          </div>
          <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border shadow-sm ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <span className="text-xs font-semibold text-brand-500 mb-2 truncate" title={litterName}>{litterName}</span>

        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          <div className="flex flex-col bg-zinc-800/40 p-2 rounded">
            <span className="text-zinc-500">Sexo</span>
            <span className="font-medium text-zinc-300">{SEX_LABEL[p.sex ?? ''] || p.sex}</span>
          </div>
          <div className="flex flex-col bg-zinc-800/40 p-2 rounded">
            <span className="text-zinc-500">Cor</span>
            <span className="font-medium text-zinc-300 truncate" title={p.color || '-'}>{p.color || '-'}</span>
          </div>
          {p.weight && (
            <div className="flex flex-col bg-zinc-800/40 p-2 rounded">
              <span className="text-zinc-500">Peso</span>
              <span className="font-medium text-zinc-300">{p.weight} kg</span>
            </div>
          )}
          {p.price && (
            <div className="flex flex-col bg-zinc-800/40 p-2 rounded">
              <span className="text-zinc-500">Preço</span>
              <span className="font-medium text-zinc-300">R$ {Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {p.client_name && (p.status === 'RESERVED' || p.status === 'SOLD') && (
          <div className="mt-4 pt-3 border-t border-zinc-800/50 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Comprador</span>
            <span className="text-sm font-medium text-zinc-300 truncate">{p.client_name}</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm p-4">
        <button className="w-full bg-brand-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-brand-600 transition-colors"
          onClick={() => onViewDetail(p)}>
          Ver Ficha
        </button>
        {p.status === 'AVAILABLE' && (
          <button
            onClick={() => onReserve(p)}
            className="w-full bg-amber-500 text-amber-950 text-sm font-bold py-2 rounded-lg hover:bg-amber-400 transition-colors"
          >
            Reservar
          </button>
        )}
        {p.status === 'RESERVED' && (
          <button
            onClick={() => onStatusChange(p.id, 'SOLD', p.name || p.color || 'Filhote')}
            disabled={actionLoading === p.id}
            className="w-full bg-emerald-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {actionLoading === p.id ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Registrando...</> : 'Registrar Venda'}
          </button>
        )}
        {p.status === 'SOLD' && (
          <span className="text-xs text-zinc-400 text-center px-4">
            Vendido para <strong className="text-zinc-200">{p.client_name || '—'}</strong>
          </span>
        )}
        {p.status === 'RETAINED' && (
          <span className="text-xs text-zinc-400 text-center">Filhote retido no canil</span>
        )}
      </div>
    </div>
  );
}
