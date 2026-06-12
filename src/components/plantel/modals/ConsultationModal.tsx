import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  consultation?: any | null;
}

export function ConsultationModal({ isOpen, onClose, onSaved, animalId, consultation }: ConsultationModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!consultation;

  useEffect(() => {
    if (isOpen) {
      if (consultation) {
        setForm({
          date: consultation.date ? consultation.date.slice(0, 10) : '',
          reason: consultation.reason || '',
          diagnosis: consultation.diagnosis || '',
          treatment: consultation.treatment || '',
          medications: consultation.medications || '',
          value: consultation.value || '',
          vetName: consultation.vet_name || '',
          clinic: consultation.clinic || '',
          notes: consultation.notes || '',
        });
      } else {
        setForm({ date: '', reason: '', diagnosis: '', treatment: '', medications: '', value: '', vetName: '', clinic: '', notes: '' });
      }
      setError(null);
    }
  }, [isOpen, consultation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.date || !form.reason) {
      setError('Data e motivo são obrigatórios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId, date: form.date, reason: form.reason,
        diagnosis: form.diagnosis || null, treatment: form.treatment || null,
        medications: form.medications || null,
        value: form.value ? parseFloat(form.value) : null,
        vetName: form.vetName || null, clinic: form.clinic || null,
        notes: form.notes || null,
      };
      const url = isEdit ? `/health/consultations/${consultation.id}` : `/health/${animalId}/consultations`;
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Consulta' : 'Registrar Consulta'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data *" type="date" value={form.date} onChange={set('date')} required />
          <FormField label="Motivo *" value={form.reason} onChange={set('reason')} required />
          <FormField label="Valor (R$)" type="number" step="0.01" value={form.value} onChange={set('value')} />
          <FormField label="Veterinário" value={form.vetName} onChange={set('vetName')} />
          <FormField label="Clínica" value={form.clinic} onChange={set('clinic')} />
        </div>
        <TextAreaField label="Diagnóstico" value={form.diagnosis} onChange={set('diagnosis')} rows={2} />
        <TextAreaField label="Tratamento Prescrito" value={form.treatment} onChange={set('treatment')} rows={2} />
        <TextAreaField label="Medicações" value={form.medications} onChange={set('medications')} rows={2} />
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


