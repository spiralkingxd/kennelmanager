import {
  Heart, Baby, Activity, Plus, AlertCircle,
  Trash2, Pencil, ExternalLink,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../shared/utils/apiFetch';
import { HeatCycleModal } from '../modals/HeatCycleModal';
import { MatingModal } from '../modals/MatingModal';
import { GestationModal } from '../modals/GestationModal';

type TimelineEvent = {
  id: string;
  date: string;
  type: 'heat' | 'mating' | 'gestation' | 'litter';
  icon: React.JSX.Element;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  data: any;
};

export function PlantelReproductionTab({ dog }: { dog: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [heatCycleModalOpen, setHeatCycleModalOpen] = useState(false);
  const [matingModalOpen, setMatingModalOpen] = useState(false);
  const [gestationModalOpen, setGestationModalOpen] = useState(false);
  const [gestationMode, setGestationMode] = useState<'create' | 'birth'>('create');

  // Edit states
  const [editingHeatCycle, setEditingHeatCycle] = useState<any>(null);
  const [editingMating, setEditingMating] = useState<any>(null);
  const [editingGestation, setEditingGestation] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    apiFetch(`/health/${dog.id}`)
      .then(res => {
        if (res.success) { setData(res.data); setError(null); }
        else { setError('Erro ao carregar dados'); }
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [dog.id]);

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
  const formatDateShort = (d: string) => d
    ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  const calcProgress = (start: string, end: string | null) => {
    if (!start) return 0;
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : s + 63 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return Math.round(((now - s) / (e - s)) * 100);
  };

  const handleDelete = async (type: string, id: string) => {
    if (deleting) return;
    setDeleting(id);
    try {
      const endpoint = type === 'heat' ? 'heat-cycles'
        : type === 'mating' ? 'matings'
        : type === 'gestation' ? 'gestations'
        : null;
      if (!endpoint) return;
      await apiFetch(`/health/${endpoint}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  };

  if (dog.sex !== 'FEMALE') {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20">
        <Heart size={32} className="text-zinc-700 mb-3" />
        <p className="text-sm text-zinc-500">Aba reprodutiva focada para fêmeas neste momento.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-zinc-500">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
      Carregando...
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-64 items-center justify-center text-zinc-500 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p>{error}</p>
      <button onClick={fetchData} className="text-sm text-brand-500 hover:underline">Tentar novamente</button>
    </div>
  );

  if (!data) return null;

  const gestations = data.gestations || [];
  const heatCycles = data.heatCycles || [];
  const matings = data.matings || [];
  const litters = data.litters || [];
  const activeGestation = gestations.find((g: any) => g.is_active);

  // Build unified timeline
  const timeline: TimelineEvent[] = [
    ...heatCycles.map((h: any) => ({
      id: h.id, date: h.start_date,
      type: 'heat' as const,
      icon: <Activity size={16} />,
      color: 'pink-500', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30',
      label: 'Cio',
      data: h,
    })),
    ...matings.map((m: any) => ({
      id: m.id, date: m.date,
      type: 'mating' as const,
      icon: <Heart size={14} />,
      color: 'rose-500', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30',
      label: 'Cobertura',
      data: m,
    })),
    ...gestations.filter((g: any) => !g.is_active).map((g: any) => ({
      id: g.id, date: g.actual_birth_date || g.expected_birth_date || g.start_date,
      type: 'gestation' as const,
      icon: <Baby size={16} />,
      color: 'purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30',
      label: 'Gestação',
      data: g,
    })),
    ...litters.map((l: any) => ({
      id: l.id, date: l.birth_date || l.created_at,
      type: 'litter' as const,
      icon: <Baby size={16} />,
      color: 'emerald-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30',
      label: 'Ninhada',
      data: l,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const colorMap: Record<string, string> = {
    'pink-500': '#ec4899', 'rose-500': '#f43f5e', 'purple-500': '#a855f7', 'emerald-500': '#10b981',
  };

  return (
    <div className="space-y-8">

      {/* Gestação Ativa */}
      {activeGestation && (
        <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/10 blur-3xl rounded-full" />
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Baby size={24} className="text-purple-400" /> Gestação em Andamento
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Ninhada estimada: {activeGestation.estimated_puppies || '?'} filhotes
              </p>
            </div>
            <button
              onClick={() => { setGestationMode('birth'); setEditingGestation(activeGestation); setGestationModalOpen(true); }}
              className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-600 transition-colors"
            >
              Registrar Parto
            </button>
          </div>

          <div className="mb-6 relative z-10">
            <div className="flex justify-between items-center text-sm font-medium mb-2">
              <span className="text-purple-400">
                Semana {activeGestation.progress_week || calcProgress(activeGestation.start_date, activeGestation.expected_birth_date)} de 9
              </span>
              <span className="text-zinc-300">Parto: {activeGestation.expected_birth_date ? formatDate(activeGestation.expected_birth_date) : 'N/I'}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-zinc-900 border border-zinc-700 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${calcProgress(activeGestation.start_date, activeGestation.expected_birth_date)}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { label: 'Início', date: activeGestation.start_date },
              { label: 'Parto Previsto', date: activeGestation.expected_birth_date },
              { label: 'Filhotes Est.', date: activeGestation.estimated_puppies?.toString() || '-' },
              { label: 'Status', date: activeGestation.is_active ? 'Ativa' : 'Finalizada' },
            ].map((m, i) => (
              <div key={i} className="flex flex-col items-center bg-zinc-900/60 border border-zinc-700/50 p-3 rounded-xl text-center">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{m.label}</span>
                <span className="text-sm font-bold text-zinc-200 mt-1">{m.date ? formatDate(m.date) : '-'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ações Rápidas */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => { setEditingHeatCycle(null); setHeatCycleModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 px-4 py-2.5 text-sm font-medium text-pink-400 hover:bg-pink-500/20 transition-colors">
          <Activity size={16} /> Registrar Cio
        </button>
        <button onClick={() => { setEditingMating(null); setMatingModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/20 transition-colors">
          <Heart size={16} /> Nova Cobertura
        </button>
        <button onClick={() => { setGestationMode('create'); setEditingGestation(null); setGestationModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 hover:bg-purple-500/20 transition-colors">
          <Baby size={16} /> Registrar Gestação
        </button>
      </div>

      {/* Status de Reprodução */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/30">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 shrink-0">
          Disponível para Reprodução
        </span>
        <button
          type="button"
          onClick={async () => {
            const newVal = !dog.is_available_for_breeding;
            try {
              await apiFetch(`/animals/${dog.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isAvailableForBreeding: newVal }),
              });
              fetchData();
            } catch {}
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
            dog.is_available_for_breeding ? 'bg-brand-500' : 'bg-zinc-700'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            dog.is_available_for_breeding ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        {dog.is_available_for_breeding ? (
          <span className="text-xs text-emerald-400">Liberado</span>
        ) : (
          <span className="text-xs text-zinc-500">Bloqueado</span>
        )}
      </div>

      {/* Timeline Unificada */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">Linha do Tempo Reprodutiva</h3>
          <span className="text-xs text-zinc-500">{timeline.length} registro{(timeline.length !== 1 ? 's' : '')}</span>
        </div>

        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20">
            <Heart size={32} className="text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">Nenhum registro reprodutivo encontrado.</p>
            <p className="text-xs text-zinc-600 mt-1">Use os botões acima para registrar o primeiro evento.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-zinc-800" />

            <div className="space-y-3">
              {timeline.map((event) => {
                const dotColor = colorMap[event.color] || '#a855f7';
                return (
                  <div key={`${event.type}-${event.id}`} className="relative flex gap-4 group">
                    {/* Dot */}
                    <div className="relative z-10 mt-1">
                      <div className={`w-9 h-9 rounded-full ${event.bgColor} border-2 ${event.borderColor} flex items-center justify-center`}
                        style={{ borderColor: dotColor + '50' }}>
                        <span style={{ color: dotColor }}>{event.icon}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 rounded-xl border ${event.borderColor} ${event.bgColor} p-4 transition-colors`}
                      style={{ borderColor: dotColor + '30' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider`} style={{ color: dotColor }}>
                              {event.label}
                            </span>
                            <span className="text-xs text-zinc-500">{formatDateShort(event.date)}</span>
                          </div>

                          {/* Content per type */}
                          {event.type === 'heat' && (
                            <div className="text-sm text-zinc-300 space-y-0.5">
                              {event.data.end_date && <span>Fim: {formatDate(event.data.end_date)}</span>}
                              <div className="flex gap-3 text-xs text-zinc-500">
                                {event.data.intensity && <span>Intensidade: {event.data.intensity}</span>}
                                {event.data.was_mated && <span className="text-pink-400 font-medium">• Coberta</span>}
                              </div>
                              {event.data.notes && <p className="text-xs text-zinc-500 mt-1">{event.data.notes}</p>}
                            </div>
                          )}

                          {event.type === 'mating' && (
                            <div className="text-sm text-zinc-300 space-y-0.5">
                              <p className="font-medium">{event.data.male_name || (event.data.male_id ? 'Macho não identificado' : 'Macho não informado')}</p>
                              <div className="flex gap-3 text-xs text-zinc-500">
                                <span>Tipo: {event.data.type || 'NATURAL'}</span>
                                {event.data.result && <span>Resultado: {event.data.result}</span>}
                              </div>
                              {event.data.notes && <p className="text-xs text-zinc-500 mt-1">{event.data.notes}</p>}
                            </div>
                          )}

                          {event.type === 'gestation' && (
                            <div className="text-sm text-zinc-300 space-y-0.5">
                              {event.data.actual_birth_date
                                ? <span>Parto realizado em {formatDate(event.data.actual_birth_date)}</span>
                                : <span>Parto previsto: {event.data.expected_birth_date ? formatDate(event.data.expected_birth_date) : 'N/I'}</span>
                              }
                              <div className="flex gap-3 text-xs text-zinc-500">
                                {event.data.estimated_puppies && <span>Filhotes: {event.data.estimated_puppies}</span>}
                                {event.data.is_active && <span className="text-purple-400">• Ativa</span>}
                              </div>
                              {event.data.notes && <p className="text-xs text-zinc-500 mt-1">{event.data.notes}</p>}
                            </div>
                          )}

                          {event.type === 'litter' && (
                            <div className="text-sm text-zinc-300 space-y-0.5">
                              <span>Ninhada de {event.data.mother_name || 'mãe'} com {event.data.father_name || 'pai não identificado'}</span>
                              <div className="flex gap-3 text-xs text-zinc-500">
                                {event.data.total_puppies && <span>Total: {event.data.total_puppies}</span>}
                                {event.data.male_count !== null && <span>Machos: {event.data.male_count}</span>}
                                {event.data.female_count !== null && <span>Fêmeas: {event.data.female_count}</span>}
                                <span className={`font-medium ${
                                  event.data.status === 'BORN' ? 'text-emerald-400'
                                  : event.data.status === 'WEANING' ? 'text-yellow-400'
                                  : event.data.status === 'COMPLETED' ? 'text-blue-400'
                                  : 'text-zinc-400'
                                }`}>{event.data.status}</span>
                              </div>
                              {event.data.notes && <p className="text-xs text-zinc-500 mt-1">{event.data.notes}</p>}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {event.type !== 'litter' && (
                            <>
                              <button
                                onClick={() => {
                                  if (event.type === 'heat') { setEditingHeatCycle(event.data); setHeatCycleModalOpen(true); }
                                  else if (event.type === 'mating') { setEditingMating(event.data); setMatingModalOpen(true); }
                                  else if (event.type === 'gestation') { setEditingGestation(event.data); setGestationMode('create'); setGestationModalOpen(true); }
                                }}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                                title="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(event.type, event.id)}
                                disabled={deleting === event.id}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                                title="Excluir"
                              >
                                {deleting === event.id
                                  ? <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                                  : <Trash2 size={14} />
                                }
                              </button>
                            </>
                          )}
                          {event.type === 'litter' && (
                            <button
                              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { tab: 'ninhadas', litterId: event.id } }))}
                              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                              title="Ver ninhada"
                            >
                              <ExternalLink size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Histórico de Ninhadas (tabela) */}
      {litters.length > 1 && (
        <section>
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
            Histórico de Ninhadas
          </h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Pai</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Machos</th>
                  <th className="px-4 py-3 text-center">Fêmeas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {litters.map((l: any) => (
                  <tr key={l.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">{l.birth_date ? formatDate(l.birth_date) : '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{l.father_name || (l.father_id ? 'Macho não identificado' : '-')}</td>
                    <td className="px-4 py-3 text-center text-zinc-300">{l.total_puppies ?? '-'}</td>
                    <td className="px-4 py-3 text-center text-zinc-300">{l.male_count ?? '-'}</td>
                    <td className="px-4 py-3 text-center text-zinc-300">{l.female_count ?? '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        l.status === 'BORN' ? 'bg-emerald-500/10 text-emerald-400'
                        : l.status === 'WEANING' ? 'bg-yellow-500/10 text-yellow-400'
                        : l.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-zinc-800 text-zinc-400'
                      }`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => {}}
                        className="text-xs text-brand-500 hover:text-brand-400 transition-colors">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Modals */}
      <HeatCycleModal
        isOpen={heatCycleModalOpen}
        onClose={() => { setHeatCycleModalOpen(false); setEditingHeatCycle(null); }}
        onSaved={fetchData}
        animalId={dog.id}
        heatCycle={editingHeatCycle}
      />
      <MatingModal
        isOpen={matingModalOpen}
        onClose={() => { setMatingModalOpen(false); setEditingMating(null); }}
        onSaved={fetchData}
        animalId={dog.id}
        mating={editingMating}
      />
      <GestationModal
        isOpen={gestationModalOpen}
        onClose={() => { setGestationModalOpen(false); setEditingGestation(null); }}
        onSaved={async () => {
          if (gestationMode === 'birth' && editingGestation) {
            let fatherId = '';
            const matingId = editingGestation.mating_id;
            if (matingId && data?.matings) {
              const mating = data.matings.find((m: any) => m.id === matingId);
              if (mating?.male_id) fatherId = mating.male_id;
            }
            try {
              const litterRes = await apiFetch('/litters', {
                method: 'POST',
                body: JSON.stringify({
                  motherId: dog.id, fatherId,
                  birthDate: new Date().toISOString().slice(0, 10),
                  status: 'BORN',
                  totalPuppies: editingGestation.estimated_puppies || null,
                  notes: 'Ninhada gerada automaticamente a partir do registro de parto.',
                }),
              });
              if (litterRes.success && litterRes.data?.id && editingGestation.id) {
                // Vincular gestação à ninhada
                await apiFetch(`/health/gestations/${editingGestation.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({ litterId: litterRes.data.id, isActive: false }),
                }).catch(() => {});
                // Vincular mating à ninhada
                if (matingId) {
                  await apiFetch(`/health/matings/${matingId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ litterId: litterRes.data.id }),
                  }).catch(() => {});
                }
              }
            } catch { /* best-effort */ }
          }
          fetchData();
        }}
        animalId={dog.id}
        gestation={gestationMode === 'birth' ? editingGestation : (editingGestation || undefined)}
        mode={gestationMode}
      />
    </div>
  );
}
