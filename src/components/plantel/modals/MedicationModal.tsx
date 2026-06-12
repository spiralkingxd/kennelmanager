import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, SelectField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

const MEDICATION_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'SUSPENDED', label: 'Suspenso' },
];

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  medication?: any | null;
}

export function MedicationModal({ isOpen, onClose, onSaved, animalId, medication }: MedicationModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!medication;

  useEffect(() => {
    if (isOpen) {
      if (medication) {
        setForm({
          name: medication.name || '',
          dose: medication.dose || '',
          route: medication.route || '',
          frequency: medication.frequency || '',
          startDate: medication.start_date ? medication.start_date.slice(0, 10) : '',
          endDate: medication.end_date ? medication.end_date.slice(0, 10) : '',
          status: medication.status || 'ACTIVE',
          notes: medication.notes || '',
        });
      } else {
        setForm({ name: '', dose: '', route: '', frequency: '', startDate: '', endDate: '', status: 'ACTIVE', notes: '' });
      }
      setError(null);
    }
  }, [isOpen, medication]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.startDate) {
      setError('Nome e data de início são obrigatórios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId, name: form.name, dose: form.dose || null, route: form.route || null,
        frequency: form.frequency || null, startDate: form.startDate, endDate: form.endDate || null,
        status: form.status, notes: form.notes || null,
      };
      const url = isEdit ? `/health/medications/${medication.id}` : `/health/${animalId}/medications`;
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Medicação' : 'Nova Medicação'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome do Medicamento *" value={form.name} onChange={set('name')} required />
          <FormField label="Dose" value={form.dose} onChange={set('dose')} placeholder="Ex: 10mg, 5ml" />
          <FormField label="Via de Administração" value={form.route} onChange={set('route')} placeholder="Ex: Oral, IV, IM" />
          <FormField label="Frequência" value={form.frequency} onChange={set('frequency')} placeholder="Ex: 8/8h, 1x ao dia" />
          <FormField label="Data de Início *" type="date" value={form.startDate} onChange={set('startDate')} required />
          <FormField label="Data de Fim" type="date" value={form.endDate} onChange={set('endDate')} />
          <SelectField label="Status" value={form.status} onChange={set('status')} options={MEDICATION_STATUS_OPTIONS} />
        </div>
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


