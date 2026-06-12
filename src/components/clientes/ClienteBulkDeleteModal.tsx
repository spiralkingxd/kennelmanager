import { useState, useEffect } from 'react';
import { Trash2, Loader2, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../plantel/modals/Modal';
import { apiFetch } from '../../shared/utils/apiFetch';

interface BulkClientImpact {
  id: string;
  name: string;
  hasActiveNegotiations: boolean;
  impact: {
    sales: number;
    client_interactions: number;
    documents: number;
    waitlist: number;
    puppies: number;
    financial_transactions: number;
    animals: number;
    calendar_events: number;
  };
}

interface BulkImpactData {
  total: number;
  hasActiveNegotiations: boolean;
  clients: BulkClientImpact[];
}

interface ClienteBulkDeleteModalProps {
  ids: string[];
  onClose: () => void;
  onSuccess: () => void;
}

type State = 'loading' | 'impact' | 'blocked' | 'confirming' | 'success' | 'error';

export function ClienteBulkDeleteModal({ ids, onClose, onSuccess }: ClienteBulkDeleteModalProps) {
  const [state, setState] = useState<State>('loading');
  const [bulkData, setBulkData] = useState<BulkImpactData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setState('loading');
    setErrorMsg('');
    apiFetch('/clients/bulk-impact', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
      .then((res) => {
        if (res.success && res.data) {
          setBulkData(res.data);
          setState(res.data.hasActiveNegotiations ? 'blocked' : 'impact');
        } else {
          setErrorMsg(res.message || 'Erro ao carregar dados');
          setState('error');
        }
      })
      .catch(() => {
        setErrorMsg('Erro de conexão ao servidor');
        setState('error');
      });
  }, [ids]);

  const handleDelete = async () => {
    setState('confirming');
    setErrorMsg('');
    try {
      const json = await apiFetch('/clients/bulk', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
      if (json.success) {
        setState('success');
      } else {
        setErrorMsg(json.message || 'Erro ao excluir');
        setState('error');
      }
    } catch {
      setErrorMsg('Erro de conexão');
      setState('error');
    }
  };

  const totalRecords = bulkData
    ? bulkData.clients.reduce((sum, c) => {
        const vals = Object.values(c.impact) as number[];
        return sum + vals.reduce((s, v) => s + v, 0);
      }, 0)
    : 0;

  return (
    <Modal isOpen={true} onClose={state === 'confirming' ? () => {} : onClose} title="Excluir Clientes Selecionados" size="md">
      {/* Loading */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
          <p className="text-sm text-zinc-400">Verificando dados vinculados...</p>
        </div>
      )}

      {/* Blocked */}
      {state === 'blocked' && bulkData && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-6">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-red-400 mb-2">Exclusão Bloqueada</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              {bulkData.clients.filter(c => c.hasActiveNegotiations).length} cliente(s) possui(em) negociações ativas no Funil de Vendas.
            </p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {bulkData.clients.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                  c.hasActiveNegotiations
                    ? 'border-red-800/50 bg-red-500/5'
                    : 'border-zinc-700 bg-zinc-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    c.hasActiveNegotiations
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                    {c.hasActiveNegotiations && (
                      <span className="ml-2 inline-flex items-center rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>
                {c.hasActiveNegotiations && <AlertTriangle size={16} className="text-red-400 shrink-0" />}
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-red-500/5 border border-red-800/50 p-4">
            <p className="text-xs text-red-400 leading-relaxed">
              Finalize ou cancele todas as negociações ativas antes de excluir estes clientes.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Impact preview */}
      {state === 'impact' && bulkData && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-4">
            <div className="rounded-full bg-amber-500/10 p-4 mb-4">
              <AlertTriangle size={36} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1">Confirmar Exclusão em Lote</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Tem certeza que deseja excluir <strong className="text-zinc-200">{bulkData.total} cliente(s)</strong>?
            </p>
          </div>

          {totalRecords > 0 ? (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 overflow-hidden max-h-60 overflow-y-auto">
              <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
                <span className="text-xs font-semibold uppercase text-zinc-400">
                  {totalRecords} registro(s) vinculado(s) — {bulkData.total} cliente(s):
                </span>
              </div>
              <div className="divide-y divide-zinc-800/80">
                {bulkData.clients.map((c) => {
                  const catEntries = (Object.entries(c.impact) as [string, number][]).filter(([, v]) => v > 0);
                  if (catEntries.length === 0) return null;
                  return (
                    <div key={c.id} className="px-4 py-2.5">
                      <p className="text-sm font-medium text-zinc-200 mb-1">{c.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {catEntries.map(([key, val]) => (
                          <span key={key} className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                            {key === 'sales' ? 'Vendas' :
                             key === 'client_interactions' ? 'Interações' :
                             key === 'documents' ? 'Documentos' :
                             key === 'waitlist' ? 'Lista Espera' :
                             key === 'puppies' ? 'Filhotes' :
                             key === 'financial_transactions' ? 'Transações' :
                             key === 'animals' ? 'Animais' :
                             key === 'calendar_events' ? 'Eventos' : key}: {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
              Sim, excluir {bulkData.total} cliente(s)
            </button>
          </div>
        </div>
      )}

      {/* Confirming */}
      {state === 'confirming' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-red-400 mb-4" />
          <p className="text-sm text-zinc-400">Excluindo clientes...</p>
        </div>
      )}

      {/* Success */}
      {state === 'success' && (
        <div className="flex flex-col items-center text-center py-8">
          <div className="rounded-full bg-emerald-500/10 p-4 mb-4">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">Clientes Excluídos</h3>
          <p className="text-sm text-zinc-400 mb-6">
            {bulkData?.total || ids.length} cliente(s) foram removidos com sucesso.
          </p>
          <button
            onClick={() => { onSuccess(); onClose(); }}
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
          <h3 className="text-lg font-bold text-red-400 mb-1">Erro ao excluir</h3>
          <p className="text-sm text-zinc-400 mb-6">{errorMsg || 'Tente novamente mais tarde.'}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
