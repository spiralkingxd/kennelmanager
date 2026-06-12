import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';
import { Modal } from '../plantel/modals/Modal';
import { FormField, SelectField, TextAreaField } from '../plantel/modals/FormFields';
import { apiFetch } from '../../shared/utils/apiFetch';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Macho' },
  { value: 'FEMALE', label: 'Fêmea' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'MATCHED', label: 'Match Encontrado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'EXPIRED', label: 'Expirado' },
  { value: 'CANCELED', label: 'Cancelado' },
];

interface ClientOption {
  id: string;
  name: string;
  phone?: string;
}

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  entry?: Record<string, any> | null;
}

// ─── ClientSearch ──────────────────────────────────────────────────────────────
function ClientSearch({
  value,
  onChange,
  clients,
  label,
  placeholder,
}: {
  value: string;
  onChange: (id: string) => void;
  clients: ClientOption[];
  label: string;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone?.toLowerCase().includes(query.toLowerCase())
  );
  const selected = clients.find((c) => c.id === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</label>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`${label}: ${selected ? selected.name : placeholder}`}
          className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 hover:border-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <User size={14} className="shrink-0 text-brand-500" />
              <span>{selected.name}</span>
              {selected.phone && <span className="text-xs text-zinc-500">({selected.phone})</span>}
            </span>
          ) : (
            <span className="text-zinc-500">{placeholder}</span>
          )}
          <ChevronDown size={16} className={`shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div role="listbox" aria-label={`Opções de ${label.toLowerCase()}`} className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="relative border-b border-zinc-800">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none" autoFocus />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-zinc-500">Nenhum cliente encontrado</div>
              ) : (
                filtered.map((client) => (
                  <button key={client.id} type="button"
                    role="option"
                    aria-selected={client.id === value}
                    onClick={() => { onChange(client.id); setOpen(false); setQuery(''); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800 ${client.id === value ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-300'}`}
                  >
                    <User size={16} className="shrink-0 text-zinc-500" />
                    <div className="flex flex-col">
                      <span>{client.name}</span>
                      {client.phone && <span className="text-xs text-zinc-500">{client.phone}</span>}
                    </div>
                    {client.id === value && <span className="ml-auto text-xs text-brand-500">Selecionado</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function WaitlistModal({ isOpen, onClose, onSaved, entry }: WaitlistModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const isEdit = !!entry;

  useEffect(() => {
    if (isOpen) {
      apiFetch('/clients?limit=1000')
        .then((res) => { if (res.success) setClients(res.data); })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (entry) {
        setForm({
          clientId: entry.client_id || '',
          preferredBreed: entry.preferred_breed || '',
          preferredGender: entry.preferred_gender || '',
          preferredColor: entry.preferred_color || '',
          maxPrice: entry.max_price ?? '',
          notes: entry.notes || '',
          status: entry.status || 'ACTIVE',
        });
      } else {
        setForm({ clientId: '', preferredBreed: '', preferredGender: '', preferredColor: '', maxPrice: '', notes: '', status: 'ACTIVE' });
      }
      setError(null);
    }
  }, [isOpen, entry]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.clientId) { setError('Selecione um cliente'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {
        clientId: form.clientId,
        preferredBreed: form.preferredBreed || null,
        preferredGender: form.preferredGender || null,
        preferredColor: form.preferredColor || null,
        maxPrice: form.maxPrice ? parseFloat(form.maxPrice) : null,
        notes: form.notes || null,
        status: form.status,
      };

      const url = isEdit ? `/waitlist/${entry!.id}` : '/waitlist';
      const method = isEdit ? 'PUT' : 'POST';

      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Lista de Espera' : 'Novo na Lista de Espera'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ClientSearch
              label="Cliente *"
              placeholder="Selecione o cliente..."
              value={form.clientId}
              onChange={(id) => setForm((prev: any) => ({ ...prev, clientId: id }))}
              clients={clients}
            />
          </div>
          <FormField label="Raça Preferida" value={form.preferredBreed} onChange={set('preferredBreed')} placeholder="Ex: Bulldog Francês" />
          <SelectField label="Sexo Preferido" value={form.preferredGender} onChange={set('preferredGender')} options={GENDER_OPTIONS} />
          <FormField label="Cor Preferida" value={form.preferredColor} onChange={set('preferredColor')} placeholder="Ex: Tigrado, Preto, Dourado" />
          <FormField label="Orçamento Máximo (R$)" type="number" value={form.maxPrice} onChange={set('maxPrice')} step="0.01" placeholder="Ex: 8000.00" />
          <SelectField label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
          <div className="md:col-span-2">
            <TextAreaField label="Observações / Finalidade" value={form.notes} onChange={set('notes')} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Adicionar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
