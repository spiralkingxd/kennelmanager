import React, { useState, useEffect } from 'react';
import { Modal } from '../plantel/modals/Modal';
import { FormField, SelectField } from '../plantel/modals/FormFields';
import { requiredSelectSchema } from '../../shared/validation/schemas';
import { ClientSearch } from './ClientSearch';
import { PuppySearch } from './PuppySearch';
import { ClientOption, PuppyOption, VendaModalProps } from './types';
import { apiFetch } from '../../shared/utils/apiFetch';
import { SALE_STATUS_OPTIONS } from './constants';

export function VendaModal({ isOpen, onClose, onSaved, venda }: VendaModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [puppies, setPuppies] = useState<PuppyOption[]>([]);
  const isEdit = !!venda;

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        apiFetch('/clients?limit=1000').then((res) => { if (res.success) setClients(res.data); }),
        apiFetch('/puppies?limit=1000').then((res) => { if (res.success) setPuppies(res.data); }),
      ]).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (venda) {
        setForm({
          clientId: venda.client_id || '',
          puppyId: venda.puppy_id || '',
          totalValue: venda.total_value ?? '',
          entryValue: venda.entry_value ?? '',
          condition: venda.condition || 'CASH',
          status: venda.status || 'PENDING',
          notes: venda.notes || '',
        });
      } else {
        setForm({
          clientId: '',
          puppyId: '',
          totalValue: '',
          entryValue: '',
          condition: 'CASH',
          status: 'PENDING',
          notes: '',
        });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, venda]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const clientResult = requiredSelectSchema('Selecione um cliente').safeParse(form.clientId);
    if (!clientResult.success) {
      setFieldErrors(prev => ({ ...prev, clientId: clientResult.error.issues[0].message }));
      return;
    }

    if (!form.totalValue && !form.entryValue) {
      setFieldErrors(prev => ({ ...prev, totalValue: 'Informe o valor total ou valor de entrada' }));
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      payload.clientId = form.clientId;
      payload.puppyId = form.puppyId || null;
      payload.totalValue = form.totalValue ? parseFloat(form.totalValue) : null;
      payload.entryValue = form.entryValue ? parseFloat(form.entryValue) : null;
      payload.condition = form.condition;
      payload.status = form.status;
      payload.notes = form.notes || null;

      const url = isEdit ? `/sales/${venda!.id}` : '/sales';
      const method = isEdit ? 'PUT' : 'POST';

      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  const statusOptions = SALE_STATUS_OPTIONS.filter(o => o.value !== '');

  const conditionOptions = [
    { value: 'CASH', label: 'À Vista' },
    { value: 'ENTRY_PLUS_BALANCE', label: 'Entrada + Saldo' },
    { value: 'INSTALLMENTS', label: 'Parcelado' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Venda' : 'Nova Venda'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ClientSearch
              label="Cliente *"
              placeholder="Selecione o cliente..."
              value={form.clientId}
              onChange={(id) => { setForm((prev: any) => ({ ...prev, clientId: id })); setFieldErrors(prev => ({...prev, clientId: ''})); }}
              clients={clients}
            />
            {fieldErrors.clientId && <p className="text-red-400 text-xs mt-1">{fieldErrors.clientId}</p>}
          </div>
          <div className="md:col-span-2">
            <PuppySearch
              label="Filhote Vendido"
              placeholder="Selecione o filhote (opcional)..."
              value={form.puppyId}
              onChange={(id) => setForm((prev: any) => ({ ...prev, puppyId: id }))}
              puppies={puppies}
            />
          </div>
          <FormField label="Valor Total (R$)" type="number" value={form.totalValue} onChange={(e) => { set('totalValue')(e); setFieldErrors(prev => ({...prev, totalValue: ''})); }} step="0.01" placeholder="Ex: 5000.00" />
          {fieldErrors.totalValue && <p className="text-red-400 text-xs mt-1">{fieldErrors.totalValue}</p>}
          <FormField label="Valor de Entrada (R$)" type="number" value={form.entryValue} onChange={set('entryValue')} step="0.01" placeholder="Ex: 1000.00" />
          <SelectField label="Condição de Pagamento" value={form.condition} onChange={set('condition')} options={conditionOptions} />
          <SelectField label="Status" value={form.status} onChange={set('status')} options={statusOptions} />
          <div className="md:col-span-2">
            <FormField label="Observações" value={form.notes} onChange={set('notes')} placeholder="Observações sobre a venda..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar Venda' : 'Registrar Venda')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
