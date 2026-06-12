import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDeleteProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export function ConfirmDelete({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  message = 'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
  loading = false,
}: ConfirmDeleteProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        <p className="text-center text-sm text-zinc-400">{message}</p>
        <div className="flex gap-3 mt-2 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Excluindo...</>
            ) : (
              'Sim, Excluir'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

