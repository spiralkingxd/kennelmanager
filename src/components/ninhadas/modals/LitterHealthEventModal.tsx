import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../plantel/modals/Modal';
import { FormField, TextAreaField } from '../../plantel/modals/FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface LitterHealthEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  litterId: string;
  event?: any | null;
}

export function LitterHealthEventModal({
  isOpen,
  onClose,
  onSaved,
  litterId,
  event,
}: LitterHealthEventModalProps) {
  const isEdit = !!event;
  const [form, setForm] = useState<any>({
    type: 'VACCINE',
    name: '',
    manufacturer: '',
    dose: '',
    date: new Date().toISOString().slice(0, 10),
    nextDueDate: '',
    amount: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setForm({
          type: event.type,
          name: event.name || '',
          manufacturer: event.manufacturer || '',
          dose: event.dose || '',
          date: event.date || '',
          nextDueDate: event.next_due_date || '',
          amount: event.amount ?? '',
          notes: event.notes || '',
        });
      } else {
        setForm({
          type: 'VACCINE',
          name: '',
          manufacturer: '',
          dose: '',
          date: new Date().toISOString().slice(0, 10),
          nextDueDate: '',
          amount: '',
          notes: '',
        });
      }
      setError(null);
    }
  }, [isOpen, event]);

  const set = (field: string) => (e: any) =>
    setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      litterId,
      type: form.type,
      name: form.name,
      manufacturer: form.manufacturer || null,
      dose: form.dose || null,
      date: form.date,
      nextDueDate: form.nextDueDate || null,
      amount: form.amount ? Number(form.amount) : null,
      notes: form.notes || null,
    };

    try {
      if (isEdit) {
        await apiFetch(`/litter-health-events/${event.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/litter-health-events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Aplicação' : 'Nova Aplicação'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3"
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="event-type-select"
            className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 block"
          >
            Tipo <span className="text-red-400 ml-1">*</span>
          </label>
          <select
            id="event-type-select"
            value={form.type}
            onChange={set('type')}
            className="h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          >
            <option value="VACCINE">Vacina</option>
            <option value="DEWORMING">Vermífugo</option>
            <option value="OTHER">Outros</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nome do Produto"
            value={form.name}
            onChange={set('name')}
            required
            placeholder="Ex: V10, Drontal Plus"
          />
          <FormField
            label="Fabricante"
            value={form.manufacturer}
            onChange={set('manufacturer')}
            placeholder="Ex: Zoetis, Bayer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Dose"
            value={form.dose}
            onChange={set('dose')}
            placeholder="1ml"
          />
          <FormField
            label="Data"
            type="date"
            value={form.date}
            onChange={set('date')}
            required
          />
          <FormField
            label="Próxima Dose"
            type="date"
            value={form.nextDueDate}
            onChange={set('nextDueDate')}
          />
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Despesa (opcional)
          </p>
          <FormField
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={set('amount')}
            placeholder="0,00"
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Se preenchido, uma transação financeira será criada automaticamente.
          </p>
        </div>

        <TextAreaField
          label="Observações"
          value={form.notes}
          onChange={set('notes')}
          rows={2}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
