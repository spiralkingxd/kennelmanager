import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteLitterModalProps {
  isOpen: boolean;
  deleting: boolean;
  litterName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteLitterModal({ isOpen, deleting, litterName, onClose, onConfirm }: DeleteLitterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && onClose()} />
      <div className="relative w-full max-w-md rounded-2xl border border-red-900/50 bg-zinc-900 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Confirmar Exclusão
          </h2>
          <button onClick={() => !deleting && onClose()} disabled={deleting} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-zinc-300">
            Tem certeza que deseja excluir a ninhada <strong className="text-white">{litterName}</strong>?
          </p>
          <div className="rounded-lg bg-red-900/20 border border-red-900/30 p-4">
            <p className="text-xs text-red-400 font-medium mb-2">Atenção: Esta ação não pode ser desfeita!</p>
            <ul className="text-xs text-red-300/70 list-disc list-inside space-y-1">
              <li>Todos os filhotes desta ninhada serão excluídos</li>
              <li>Os registros de vendas serão mantidos mas ficarão órfãos</li>
              <li>O histórico de reprodução será afetado</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} disabled={deleting} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={deleting} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {deleting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Excluindo...</> : <>Excluir Ninhada</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
