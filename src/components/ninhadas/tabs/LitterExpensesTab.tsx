import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Syringe, Pill, Receipt, HelpCircle } from 'lucide-react';
import { formatDateBR } from '../../../shared/utils/dateUtils';
import { apiFetch } from '../../../shared/utils/apiFetch';
import { LitterHealthEventModal } from '../modals/LitterHealthEventModal';

interface LitterExpensesTabProps {
  litterId: string;
}

export function LitterExpensesTab({ litterId }: LitterExpensesTabProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'VACCINE' | 'DEWORMING' | 'OTHER'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/litter-health-events?litterId=${litterId}`);
      if (res.success) setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [litterId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta aplicação? A despesa vinculada será removida.')) return;
    try {
      await apiFetch(`/litter-health-events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
  };

  const filtered = events.filter((e) => filter === 'ALL' || e.type === filter);

  const totalGasto = events.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalVacinas = events.filter((e) => e.type === 'VACCINE').length;
  const totalVermifugos = events.filter((e) => e.type === 'DEWORMING').length;
  const totalOutros = events.filter((e) => e.type === 'OTHER').length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 uppercase">Total Gasto</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">
            {totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 uppercase">Vacinas</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{totalVacinas}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 uppercase">Vermífugos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalVermifugos}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 uppercase">Outros</p>
          <p className="text-2xl font-bold text-zinc-400 mt-1">{totalOutros}</p>
        </div>
      </div>

      {/* Header + Filtro */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['ALL', 'VACCINE', 'DEWORMING', 'OTHER'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-xs ${
                filter === f
                  ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                  : 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {f === 'ALL' ? 'Todos' : f === 'VACCINE' ? 'Vacinas' : f === 'DEWORMING' ? 'Vermífugos' : 'Outros'}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditingEvent(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-500"
        >
          <Plus size={16} /> Registrar Aplicação
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-500">
          Carregando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 p-8 text-center">
          <Receipt size={32} className="mx-auto text-zinc-700 mb-2" />
          <p className="text-zinc-500 text-sm">
            Nenhuma aplicação registrada. Clique em {`"`}Registrar Aplicação{`"`} para começar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-right">Valor</th>
                <th className="px-3 py-2 text-left">Próxima</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-900/30">
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        e.type === 'VACCINE'
                          ? 'bg-blue-500/10 text-blue-300'
                          : e.type === 'DEWORMING'
                          ? 'bg-green-500/10 text-green-300'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {e.type === 'VACCINE' ? <Syringe size={10} /> : e.type === 'DEWORMING' ? <Pill size={10} /> : <HelpCircle size={10} />}
                      {e.type === 'VACCINE' ? 'Vacina' : e.type === 'DEWORMING' ? 'Vermífugo' : 'Outros'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-200">{e.name}</td>
                  <td className="px-3 py-2 text-zinc-400">{formatDateBR(e.date)}</td>
                  <td className="px-3 py-2 text-right text-zinc-200">
                    {e.amount
                      ? Number(e.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">
                    {e.next_due_date ? formatDateBR(e.next_due_date) : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => {
                        setEditingEvent(e);
                        setModalOpen(true);
                      }}
                      className="text-zinc-500 hover:text-brand-400 mr-1"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LitterHealthEventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSaved={fetchEvents}
        litterId={litterId}
        event={editingEvent}
      />
    </div>
  );
}
