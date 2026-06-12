import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface DewormingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  deworming?: any | null;
}

export function DewormingModal({ isOpen, onClose, onSaved, animalId, deworming }: DewormingModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!deworming;

  useEffect(() => {
    if (isOpen) {
      if (deworming) {
        setForm({
          product: deworming.product || '',
          activeIngredient: deworming.active_ingredient || '',
          dose: deworming.dose || '',
          weightAtDate: deworming.weight_at_date || '',
          date: deworming.date ? deworming.date.slice(0, 10) : '',
          nextDueDate: deworming.next_due_date ? deworming.next_due_date.slice(0, 10) : '',
          vetName: deworming.vet_name || '',
          notes: deworming.notes || '',
        });
      } else {
        setForm({ product: '', activeIngredient: '', dose: '', weightAtDate: '', date: '', nextDueDate: '', vetName: '', notes: '' });
      }
      setError(null);
    }
  }, [isOpen, deworming]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.product || !form.date) {
      setError('Produto e data são obrigatórios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId,
        product: form.product,
        activeIngredient: form.activeIngredient || null,
        dose: form.dose || null,
        weightAtDate: form.weightAtDate ? parseFloat(form.weightAtDate) : null,
        date: form.date,
        nextDueDate: form.nextDueDate || null,
        vetName: form.vetName || null,
        notes: form.notes || null,
      };
      const url = isEdit ? `/health/deworming/${deworming.id}` : `/health/${animalId}/deworming`;
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Vermífugo' : 'Registrar Vermífugo'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Produto *" value={form.product} onChange={set('product')} required />
          <FormField label="Princípio Ativo" value={form.activeIngredient} onChange={set('activeIngredient')} />
          <FormField label="Dose" value={form.dose} onChange={set('dose')} />
          <FormField label="Peso na Data (kg)" type="number" step="0.1" value={form.weightAtDate} onChange={set('weightAtDate')} />
          <FormField label="Data de Aplicação *" type="date" value={form.date} onChange={set('date')} required />
          <FormField label="Próxima Dose" type="date" value={form.nextDueDate} onChange={set('nextDueDate')} />
          <FormField label="Veterinário" value={form.vetName} onChange={set('vetName')} />
        </div>
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} />
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


