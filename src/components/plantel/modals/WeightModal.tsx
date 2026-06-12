import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
}

export function WeightModal({ isOpen, onClose, onSaved, animalId }: WeightModalProps) {
  const [form, setForm] = useState<any>({ weight: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ weight: '', date: new Date().toISOString().slice(0, 10), notes: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.weight || parseFloat(form.weight) <= 0) {
      setError('Peso deve ser um valor positivo');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { animalId, weight: parseFloat(form.weight), date: form.date, notes: form.notes || null };
      const json = await apiFetch(`/health/${animalId}/weight`, {
        method: 'POST', body: JSON.stringify(payload),
      });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Peso" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <FormField label="Peso (kg) *" type="number" step="0.1" value={form.weight} onChange={set('weight')} required />
        <FormField label="Data" type="date" value={form.date} onChange={set('date')} />
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={2} />
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


