import { useState, useEffect, type ReactNode } from 'react';
import { Loader2, Trash2, AlertTriangle, Heart, Dog, Baby } from 'lucide-react';
import { Modal } from '../plantel/modals/Modal';
import type { Animal, HeatCycle, Mating, Gestation } from './types';
import { formatDate } from './utils';
import { apiFetch } from '../../shared/utils/apiFetch';

interface RegistroReprodutivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  animal: Animal;
  onRefresh: () => void;
}

type TabType = 'heatCycles' | 'matings' | 'gestations';

const TAB_LABELS: Record<TabType, string> = {
  heatCycles: 'Ciclos de Cio',
  matings: 'Coberturas',
  gestations: 'Gestações',
};

const TAB_ICONS: Record<TabType, ReactNode> = {
  heatCycles: <Heart size={16} />,
  matings: <Dog size={16} />,
  gestations: <Baby size={16} />,
};

const INTENSITY_LABELS: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export function RegistroReprodutivoModal({ isOpen, onClose, animal, onRefresh }: RegistroReprodutivoModalProps) {
  const [tab, setTab] = useState<TabType>('heatCycles');
  const [loading, setLoading] = useState(true);
  const [heatCycles, setHeatCycles] = useState<HeatCycle[]>([]);
  const [matings, setMatings] = useState<Mating[]>([]);
  const [gestations, setGestations] = useState<Gestation[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setDeleting(null);

    apiFetch(`/health/${animal.id}/heat-cycles`)
      .then(j => { if (j.success) setHeatCycles(j.data || []); })
      .catch(() => {});

    apiFetch(`/health/${animal.id}/matings`)
      .then(j => { if (j.success) setMatings(j.data || []); })
      .catch(() => {});

    apiFetch(`/health/${animal.id}/gestations`)
      .then(j => { if (j.success) setGestations(j.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, animal.id]);

  const handleDelete = async (type: TabType, id: string) => {
    setDeleting(id);
    setError(null);
    const endpoints: Record<TabType, string> = {
      heatCycles: `/health/heat-cycles/${id}`,
      matings: `/health/matings/${id}`,
      gestations: `/health/gestations/${id}`,
    };
    try {
      const json = await apiFetch(endpoints[type], { method: 'DELETE' });
      if (json.success) {
        if (type === 'heatCycles') setHeatCycles(prev => prev.filter(h => h.id !== id));
        else if (type === 'matings') setMatings(prev => prev.filter(m => m.id !== id));
        else setGestations(prev => prev.filter(g => g.id !== id));
        onRefresh();
      } else {
        setError(json.message || 'Erro ao excluir registro');
      }
    } catch {
      setError('Erro de conexão ao servidor');
    } finally {
      setDeleting(null);
    }
  };

  const counts = { heatCycles: heatCycles.length, matings: matings.length, gestations: gestations.length };
  const tabs: TabType[] = ['heatCycles', 'matings', 'gestations'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Registros Reprodutivos — ${animal.name}`} size="lg">
      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-800/50 px-4 py-2.5 mb-4">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-zinc-800">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {TAB_ICONS[t]}
            {TAB_LABELS[t]}
            <span className="ml-1 text-xs text-zinc-600">({counts[t]})</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-brand-500 mb-3" />
          <p className="text-sm text-zinc-500">Carregando registros...</p>
        </div>
      ) : (
        <>
          {/* Heat Cycles */}
          {tab === 'heatCycles' && (
            <div className="space-y-1">
              {heatCycles.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">Nenhum ciclo de cio registrado.</p>
              ) : (
                heatCycles.map(h => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg bg-zinc-800/20 px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-300">{formatDate(h.start_date)}</span>
                      {h.end_date && <span className="text-zinc-500">→ {formatDate(h.end_date)}</span>}
                      {h.intensity && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          h.intensity === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                          h.intensity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-zinc-700/50 text-zinc-400'
                        }`}>
                          {INTENSITY_LABELS[h.intensity] || h.intensity}
                        </span>
                      )}
                      {h.was_mated && <span className="text-xs text-brand-400 font-medium">Coberta</span>}
                    </div>
                    <button
                      onClick={() => handleDelete('heatCycles', h.id)}
                      disabled={deleting === h.id}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === h.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      {deleting === h.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Matings */}
          {tab === 'matings' && (
            <div className="space-y-1">
              {matings.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">Nenhuma cobertura registrada.</p>
              ) : (
                matings.map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-zinc-800/20 px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-300">{formatDate(m.date)}</span>
                      <span className="text-zinc-400">Macho: <span className="text-zinc-300">{m.male_name || m.male_id}</span></span>
                      {m.result && <span className="text-xs text-zinc-500">({m.result})</span>}
                    </div>
                    <button
                      onClick={() => handleDelete('matings', m.id)}
                      disabled={deleting === m.id}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deleting === m.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      {deleting === m.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Gestations */}
          {tab === 'gestations' && (
            <div className="space-y-1">
              {gestations.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">Nenhuma gestação registrada.</p>
              ) : (
                gestations.map(g => (
                  <div key={g.id} className="flex items-center justify-between rounded-lg bg-zinc-800/20 px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-300">Início: {formatDate(g.start_date)}</span>
                      {g.expected_birth_date && <span className="text-zinc-500">Parto previsto: {formatDate(g.expected_birth_date)}</span>}
                      {g.actual_birth_date && <span className="text-emerald-400">Parto: {formatDate(g.actual_birth_date)}</span>}
                      {g.is_active && <span className="text-xs text-amber-400 font-medium">Ativa</span>}
                    </div>
                    <button
                      onClick={() => handleDelete('gestations', g.id)}
                      disabled={deleting === g.id || (g.is_active && gestations.length <= 1)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title={g.is_active ? 'Gestação ativa em andamento' : 'Excluir gestação'}
                    >
                      {deleting === g.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      {deleting === g.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-4 mt-4 border-t border-zinc-800">
        <button
          onClick={onClose}
          className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}
