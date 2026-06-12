import React, { useState } from 'react';
import { Modal } from '../plantel/modals/Modal';
import { FormField, SelectField, TextAreaField } from '../plantel/modals/FormFields';
import { nameSchema, optionalEmailSchema, phoneSchema } from '../../shared/validation/schemas';
import { apiFetch } from '../../shared/utils/apiFetch';

const HOW_FOUND_OPTIONS = [
  { value: '', label: 'Selecione...' },
  { value: 'INDICACAO', label: 'Indicação' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'OLX', label: 'OLX' },
  { value: 'SITE', label: 'Site' },
  { value: 'FEIRA', label: 'Feira/Evento' },
  { value: 'OUTRO', label: 'Outro' },
];

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (cliente: any) => void;
  cliente?: Record<string, any> | null;
}

export function ClienteModal({ isOpen, onClose, onSaved, cliente }: ClienteModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = !!cliente;

  React.useEffect(() => {
    if (isOpen) {
      if (cliente) {
        setForm({
          name: cliente.name || '',
          email: cliente.email || '',
          phone: cliente.phone || '',
          secondaryPhone: cliente.secondary_phone || '',
          address: cliente.address || '',
          city: cliente.city || '',
          state: cliente.state || '',
          zipCode: cliente.zip_code || '',
          birthDate: cliente.birth_date || '',
          profession: cliente.profession || '',
          notes: cliente.notes || '',
          howFoundUs: cliente.how_found_us || '',
        });
      } else {
        setForm({ name: '', email: '', phone: '', secondaryPhone: '', address: '', city: '', state: '', zipCode: '', birthDate: '', profession: '', notes: '', howFoundUs: '' });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, cliente]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const nameResult = nameSchema.safeParse(form.name);
    if (!nameResult.success) {
      setFieldErrors(prev => ({ ...prev, name: nameResult.error.issues[0].message }));
      return;
    }
    if (form.email) {
      const emailResult = optionalEmailSchema.safeParse(form.email);
      if (!emailResult.success) {
        setFieldErrors(prev => ({ ...prev, email: 'Email inválido' }));
        return;
      }
    }
    if (form.phone) {
      const phoneResult = phoneSchema.safeParse(form.phone);
      if (!phoneResult.success) {
        setFieldErrors(prev => ({ ...prev, phone: 'Telefone inválido' }));
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        secondaryPhone: form.secondaryPhone || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode || null,
        birthDate: form.birthDate || null,
        profession: form.profession || null,
        notes: form.notes || null,
        howFoundUs: form.howFoundUs || null,
      };

      const url = isEdit ? `/clients/${cliente!.id}` : '/clients';
      const method = isEdit ? 'PUT' : 'POST';

      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(json.data); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField label="Nome *" value={form.name} onChange={(e) => { set('name')(e); setFieldErrors(prev => ({...prev, name: ''})); }} placeholder="Nome completo" required />
            {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
          </div>
          <FormField label="E-mail" type="email" value={form.email} onChange={(e) => { set('email')(e); setFieldErrors(prev => ({...prev, email: ''})); }} placeholder="email@exemplo.com" />
          {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
          <FormField label="Telefone Principal" value={form.phone} onChange={(e) => { set('phone')(e); setFieldErrors(prev => ({...prev, phone: ''})); }} placeholder="(11) 99999-0000" />
          {fieldErrors.phone && <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>}
          <FormField label="Telefone Secundário" value={form.secondaryPhone} onChange={set('secondaryPhone')} placeholder="(11) 99999-0000" />
          <FormField label="Data de Nascimento" type="date" value={form.birthDate} onChange={set('birthDate')} />
          <FormField label="Profissão" value={form.profession} onChange={set('profession')} placeholder="Profissão do cliente" />
          <select
            value={form.howFoundUs}
            onChange={set('howFoundUs')}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {HOW_FOUND_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="md:col-span-2">
            <FormField label="Endereço" value={form.address} onChange={set('address')} placeholder="Rua, número, bairro" />
          </div>
          <FormField label="Cidade" value={form.city} onChange={set('city')} placeholder="Cidade" />
          <FormField label="Estado" value={form.state} onChange={set('state')} placeholder="UF" />
          <FormField label="CEP" value={form.zipCode} onChange={set('zipCode')} placeholder="00000-000" />
          <div className="md:col-span-2">
            <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Criar Cliente')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
