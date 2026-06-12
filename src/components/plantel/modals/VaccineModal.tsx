import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface VaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  vaccine?: any | null;
}

export function VaccineModal({ isOpen, onClose, onSaved, animalId, vaccine }: VaccineModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!vaccine;

  useEffect(() => {
    if (isOpen) {
      if (vaccine) {
        setForm({
          name: vaccine.name || '',
          manufacturer: vaccine.manufacturer || '',
          batch: vaccine.batch || '',
          dose: vaccine.dose || '',
          date: vaccine.date ? vaccine.date.slice(0, 10) : '',
          nextDueDate: vaccine.next_due_date ? vaccine.next_due_date.slice(0, 10) : '',
          vetName: vaccine.vet_name || '',
          clinic: vaccine.clinic || '',
          notes: vaccine.notes || '',
        });
      } else {
        setForm({ name: '', manufacturer: '', batch: '', dose: '', date: '', nextDueDate: '', vetName: '', clinic: '', notes: '' });
      }
      setError(null);
    }
  }, [isOpen, vaccine]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.date) {
      setError('Nome e data são obrigatórios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId,
        name: form.name,
        manufacturer: form.manufacturer || null,
        batch: form.batch || null,
        dose: form.dose || null,
        date: form.date,
        nextDueDate: form.nextDueDate || null,
        vetName: form.vetName || null,
        clinic: form.clinic || null,
        notes: form.notes || null,
      };

      const url = isEdit
        ? `/health/vaccines/${vaccine.id}`
        : `/health/${animalId}/vaccines`;
      const method = isEdit ? 'PUT' : 'POST';

      const json = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });
      if (json.success) {
        onSaved();
        onClose();
      } else {
        setError(json.message || 'Erro ao salvar vacina');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Vacina' : 'Nova Vacina'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome da Vacina *" value={form.name} onChange={set('name')} required />
          <FormField label="Fabricante" value={form.manufacturer} onChange={set('manufacturer')} />
          <FormField label="Lote" value={form.batch} onChange={set('batch')} />
          <FormField label="Dose" value={form.dose} onChange={set('dose')} />
          <FormField label="Data de Aplicação *" type="date" value={form.date} onChange={set('date')} required />
          <FormField label="Próxima Dose" type="date" value={form.nextDueDate} onChange={set('nextDueDate')} />
          <FormField label="Veterinário" value={form.vetName} onChange={set('vetName')} />
          <FormField label="Clínica" value={form.clinic} onChange={set('clinic')} />
        </div>
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}


