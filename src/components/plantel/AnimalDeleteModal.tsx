import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from './modals/Modal';
import { apiFetch } from '../../shared/utils/apiFetch';
import { ImpactBreakdownLitters } from './ImpactBreakdownLitters';
import { ImpactBreakdownVaccines } from './ImpactBreakdownVaccines';
import { ImpactBreakdownFinancial } from './ImpactBreakdownFinancial';
import { ImpactBreakdownHealth } from './ImpactBreakdownHealth';
import { ImpactBreakdownCalendar } from './ImpactBreakdownCalendar';

export interface ImpactData {
  counts: {
    litters: number;
    matings: number;
    gestations: number;
    heat_cycles: number;
    vaccines: number;
    deworming: number;
    exams: number;
    consultations: number;
    weight_history: number;
    medications: number;
    documents: number;
    financial_transactions: number;
    calendar_events: number;
  };
  details: {
    litters: { id: string; mother_id: string; father_id: string; birth_date: string; status: string; notes: string }[];
    matings: { id: string; female_id: string; male_id: string; type: string; date: string }[];
    gestations: { id: string; animal_id: string; start_date: string; is_active: boolean }[];
    heat_cycles: { id: string; start_date: string; end_date: string; intensity: string; was_mated: boolean }[];
    vaccines: { id: string; name: string; date: string; next_due_date: string }[];
    deworming: { id: string; product: string; date: string; next_due_date: string }[];
    exams: { id: string; type: string; date: string; result: string }[];
    consultations: { id: string; date: string; reason: string; diagnosis: string }[];
    weight_history: { id: string; weight: string; date: string }[];
    medications: { id: string; name: string; start_date: string; status: string }[];
    documents: { id: string; type: string; name: string; created_at: string }[];
    financial_transactions: { id: string; type: string; amount: string; status: string; date: string }[];
    calendar_events: { id: string; title: string; date: string; category: string }[];
  };
  hasActiveGestations: boolean;
}

interface AnimalDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  animalId: string;
  animalName: string;
  onDeleted: () => void;
}

type State = 'loading' | 'impact' | 'confirming' | 'success' | 'error';

export function AnimalDeleteModal({ isOpen, onClose, animalId, animalName, onDeleted }: AnimalDeleteModalProps) {
  const [state, setState] = useState<State>('loading');
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorPhase, setErrorPhase] = useState<'impact' | 'delete'>('impact');

  useEffect(() => {
    if (!isOpen) return;
    setState('loading');
    setImpact(null);
    setErrorMsg('');
    setErrorPhase('impact');
    apiFetch(`/animals/${animalId}/impact`)
      .then(res => {
        if (res.success && res.data) {
          setImpact(res.data);
          setState('impact');
        } else {
          setErrorMsg(res.message || 'Erro ao carregar dados');
          setErrorPhase('impact');
          setState('error');
        }
      })
      .catch(() => {
        setErrorMsg('Erro de conexão ao servidor');
        setErrorPhase('impact');
        setState('error');
      });
  }, [isOpen, animalId]);

  const handleDelete = async () => {
    setState('confirming');
    setErrorMsg('');
    try {
      const json = await apiFetch(`/animals/${animalId}`, { method: 'DELETE' });
      if (json.success) {
        setState('success');
      } else {
        setErrorMsg(json.message || 'Erro ao excluir animal');
        setErrorPhase('delete');
        setState('error');
      }
    } catch {
      setErrorMsg('Erro de conexão');
      setErrorPhase('delete');
      setState('error');
    }
  };

  const reloadImpact = () => {
    setState('loading');
    setErrorMsg('');
    setErrorPhase('impact');
    apiFetch(`/animals/${animalId}/impact`)
      .then(res => {
        if (res.success && res.data) {
          setImpact(res.data);
          setState('impact');
        } else {
          setErrorMsg(res.message || 'Erro ao carregar dados');
          setState('error');
        }
      })
      .catch(() => {
        setErrorMsg('Erro de conexão ao servidor');
        setState('error');
      });
  };

  // Fechamento do modal no estado "success" deve disparar refresh da lista
  const handleModalClose = () => {
    if (state === 'success') onDeleted();
    onClose();
  };

  const totalRecords = impact
    ? (Object.values(impact.counts) as number[]).reduce((s, v) => s + v, 0)
    : 0;

  const hasLitters = impact?.counts.litters > 0 || impact?.counts.matings > 0 || impact?.counts.gestations > 0 || impact?.counts.heat_cycles > 0;
  const hasVaccines = impact?.counts.vaccines > 0 || impact?.counts.deworming > 0;
  const hasFinancial = impact?.counts.financial_transactions > 0;
  const hasHealth = impact?.counts.exams > 0 || impact?.counts.consultations > 0 || impact?.counts.weight_history > 0 || impact?.counts.medications > 0 || impact?.counts.documents > 0;
  const hasCalendar = impact?.counts.calendar_events > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title="Excluir Animal" size="md">
      {/* Loading */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
          <p className="text-sm text-zinc-400">Verificando dados vinculados...</p>
        </div>
      )}

      {/* Impact preview */}
      {state === 'impact' && impact && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-4">
            <div className="rounded-full bg-amber-500/10 p-4 mb-4">
              <AlertTriangle size={36} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1">Confirmar Exclusão</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Tem certeza que deseja excluir <strong className="text-zinc-200">{animalName}</strong>?
            </p>
            <p className="text-xs text-red-400 mt-2 font-medium">
              Esta ação é irreversível. Todos os dados relacionados serão perdidos permanentemente.
            </p>
          </div>

          {totalRecords > 0 ? (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
                <span className="text-xs font-semibold uppercase text-zinc-400">
                  {totalRecords} registro{totalRecords !== 1 ? 's' : ''} vinculado{totalRecords !== 1 ? 's' : ''} — clique para detalhes:
                </span>
              </div>
              <div className="divide-y divide-zinc-800/80 overflow-y-auto">
                {hasLitters && <ImpactBreakdownLitters impact={impact} />}
                {hasVaccines && <ImpactBreakdownVaccines impact={impact} />}
                {hasFinancial && <ImpactBreakdownFinancial impact={impact} />}
                {hasHealth && <ImpactBreakdownHealth impact={impact} />}
                {hasCalendar && <ImpactBreakdownCalendar impact={impact} />}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 px-4 py-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">Nenhum registro vinculado encontrado.</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Sim, excluir permanentemente
            </button>
          </div>
        </div>
      )}

      {/* Confirming */}
      {state === 'confirming' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-red-400 mb-4" />
          <p className="text-sm text-zinc-400">Excluindo animal...</p>
        </div>
      )}

      {/* Success */}
      {state === 'success' && (
        <div className="flex flex-col items-center text-center py-8">
          <div className="rounded-full bg-emerald-500/10 p-4 mb-4">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">Animal Excluído</h3>
          <p className="text-sm text-zinc-400 mb-6">
            {animalName} foi removido. Registros de saúde e financeiros foram excluídos; vínculos em ninhadas e coberturas foram desassociados.
          </p>
          <button
            onClick={() => { onDeleted(); onClose(); }}
            className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="flex flex-col items-center text-center py-8">
          <div className="rounded-full bg-red-500/10 p-4 mb-4">
            <AlertCircle size={36} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-red-400 mb-1">
            {errorPhase === 'impact' ? 'Erro ao carregar dados' : 'Erro ao excluir'}
          </h3>
          <p className="text-sm text-zinc-400 mb-6">{errorMsg || 'Tente novamente mais tarde.'}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Fechar
            </button>
            {errorPhase === 'delete' ? (
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors"
              >
                Tentar novamente
              </button>
            ) : (
              <button
                onClick={reloadImpact}
                className="rounded-lg bg-zinc-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-600 transition-colors"
              >
                Recarregar dados
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
