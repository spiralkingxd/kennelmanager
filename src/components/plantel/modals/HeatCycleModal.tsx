import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface HeatCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  heatCycle?: any | null;
}

export function HeatCycleModal({ isOpen, onClose, onSaved, animalId, heatCycle }: HeatCycleModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!heatCycle;

  useEffect(() => {
    if (isOpen) {
      if (heatCycle) {
        setForm({
          startDate: heatCycle.start_date ? heatCycle.start_date.slice(0, 10) : '',
          endDate: heatCycle.end_date ? heatCycle.end_date.slice(0, 10) : '',
          intensity: heatCycle.intensity || '',
          wasMated: heatCycle.was_mated || false,
          notes: heatCycle.notes || '',
        });
      } else {
        setForm({ startDate: '', endDate: '', intensity: '', wasMated: false, notes: '' });
      }
      setError(null);
    }
  }, [isOpen, heatCycle]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.startDate) { setError('Data de início é obrigatória'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId, startDate: form.startDate, endDate: form.endDate || null,
        intensity: form.intensity || null, wasMated: form.wasMated, notes: form.notes || null,
      };
      const url = isEdit ? `/health/heat-cycles/${heatCycle.id}` : `/health/${animalId}/heat-cycles`;
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));
  const setCheck = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.checked }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Ciclo de Cio' : 'Registrar Cio'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data de Início *" type="date" value={form.startDate} onChange={set('startDate')} required />
          <FormField label="Data de Fim" type="date" value={form.endDate} onChange={set('endDate')} />
          <FormField label="Intensidade" value={form.intensity} onChange={set('intensity')} placeholder="Ex: Forte, Moderada, Fraca" />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={form.wasMated} onChange={setCheck('wasMated')}
            className="rounded border-zinc-600 bg-zinc-800 text-brand-500 focus:ring-brand-500" />
          Foi coberta
        </label>
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={2} />
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}


