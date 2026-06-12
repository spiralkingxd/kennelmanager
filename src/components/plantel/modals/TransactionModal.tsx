import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, SelectField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'INCOME', label: 'Receita' },
];

const CATEGORY_OPTIONS = [
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'VET', label: 'Veterinário' },
  { value: 'VACCINES', label: 'Vacinas' },
  { value: 'EXAMS', label: 'Exames' },
  { value: 'MEDICATION', label: 'Medicamentos' },
  { value: 'REPRODUCTION', label: 'Reprodução' },
  { value: 'EXHIBITION', label: 'Exposições' },
  { value: 'OTHER', label: 'Outro' },
];

const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Pago' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
}

export function TransactionModal({ isOpen, onClose, onSaved, animalId }: TransactionModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ type: 'EXPENSE', category: 'VET', amount: '', date: new Date().toISOString().slice(0, 10), description: '', status: 'PAID' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Valor deve ser positivo'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId, type: form.type, category: form.category,
        amount: parseFloat(form.amount), date: form.date,
        description: form.description || null, status: form.status,
      };
      const json = await apiFetch('/financial', {
        method: 'POST', body: JSON.stringify(payload),
      });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Movimentação Financeira" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Tipo *" value={form.type} onChange={set('type')} options={TRANSACTION_TYPE_OPTIONS} />
          <SelectField label="Categoria *" value={form.category} onChange={set('category')} options={CATEGORY_OPTIONS} />
          <FormField label="Valor (R$) *" type="number" step="0.01" value={form.amount} onChange={set('amount')} required />
          <FormField label="Data *" type="date" value={form.date} onChange={set('date')} />
          <SelectField label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
        </div>
        <TextAreaField label="Descrição" value={form.description} onChange={set('description')} rows={2} />
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


