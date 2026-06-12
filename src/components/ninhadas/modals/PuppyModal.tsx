import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';
import { Modal } from '../../plantel/modals/Modal';
import { FormField, SelectField } from '../../plantel/modals/FormFields';
import { nameSchema, positiveNumberOrEmpty } from '../../../shared/validation/schemas';
import { apiFetch } from '../../../shared/utils/apiFetch';

const SEX_OPTIONS = [
  { value: 'MALE', label: 'Macho' },
  { value: 'FEMALE', label: 'Fêmea' },
];

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'RESERVED', label: 'Reservado' },
  { value: 'SOLD', label: 'Vendido' },
  { value: 'RETAINED', label: 'Retido' },
];

interface PuppyData {
  id: string;
  name: string;
  sex: string;
  color?: string;
  weight?: number;
  price?: number;
  status?: string;
  client_id?: string;
}

interface PuppyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  litterId: string;
  puppy?: PuppyData | null;
}

interface ClientOption {
  id: string;
  name: string;
  phone?: string;
}

// ─── Componente de busca de cliente ───────────────────────────────────────────
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
export function PuppyModal({ isOpen, onClose, onSaved, litterId, puppy }: PuppyModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<ClientOption[]>([]);
  const isEdit = !!puppy;

  // Carregar clientes
  useEffect(() => {
    if (isOpen) {
      apiFetch('/clients?limit=1000')
        .then((res) => { if (res.success) setClients(res.data); })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (puppy) {
        setForm({
          name: puppy.name || '',
          sex: puppy.sex || 'MALE',
          color: puppy.color || '',
          weight: puppy.weight ?? '',
          price: puppy.price ?? '',
          status: puppy.status || 'AVAILABLE',
          clientId: puppy.client_id || '',
        });
      } else {
        setForm({ name: '', sex: 'MALE', color: '', weight: '', price: '', status: 'AVAILABLE', clientId: '' });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, puppy]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Nome é obrigatório apenas se status for SOLD
    if (form.status === 'SOLD') {
      const nameResult = nameSchema.safeParse(form.name);
      if (!nameResult.success) {
        setFieldErrors(prev => ({ ...prev, name: nameResult.error.issues[0].message }));
        return;
      }
    }

    if (form.weight) {
      const weightParsed = parseFloat(form.weight);
      if (isNaN(weightParsed) || weightParsed < 0) {
        setFieldErrors(prev => ({ ...prev, weight: 'Peso deve ser um valor válido' }));
        return;
      }
    }

    if (form.price) {
      const priceParsed = parseFloat(form.price);
      if (isNaN(priceParsed) || priceParsed < 0) {
        setFieldErrors(prev => ({ ...prev, price: 'Preço deve ser um valor válido' }));
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name: form.name,
        sex: form.sex,
        color: form.color || null,
        weight: form.weight ? parseFloat(form.weight) : null,
        price: form.price ? parseFloat(form.price) : null,
        status: form.status || null,
        clientId: form.clientId || null,
      };

      let url: string;
      let method: string;
      if (isEdit) {
        url = `/puppies/${puppy!.id}`;
        method = 'PUT';
      } else {
        url = '/puppies';
        method = 'POST';
        payload.litterId = litterId;
      }

      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Filhote' : 'Novo Filhote'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <FormField label="Nome" value={form.name} onChange={(e) => { set('name')(e); setFieldErrors(prev => ({...prev, name: ''})); }} placeholder="Nome do filhote" />
            {fieldErrors.name && <p className="text-red-400 text-xs">{fieldErrors.name}</p>}
          </div>
          <SelectField label="Sexo *" value={form.sex} onChange={set('sex')} options={SEX_OPTIONS} required />
          <div className="flex flex-col gap-1">
            <FormField label="Cor" value={form.color} onChange={set('color')} placeholder="Ex: Preto, Caramelo, Tigrado" />
          </div>
          <div className="flex flex-col gap-1">
            <FormField label="Peso (kg)" type="number" value={form.weight} onChange={(e) => { set('weight')(e); setFieldErrors(prev => ({...prev, weight: ''})); }} step="0.01" placeholder="Ex: 2.5" />
            {fieldErrors.weight && <p className="text-red-400 text-xs">{fieldErrors.weight}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <FormField label="Preço (R$)" type="number" value={form.price} onChange={(e) => { set('price')(e); setFieldErrors(prev => ({...prev, price: ''})); }} step="0.01" placeholder="Ex: 5000.00" />
            {fieldErrors.price && <p className="text-red-400 text-xs">{fieldErrors.price}</p>}
          </div>
          <SelectField label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
          <div className="md:col-span-2">
            <ClientSearch
              label="Cliente (Comprador)"
              placeholder="Selecione o cliente..."
              value={form.clientId}
              onChange={(id) => setForm((prev: any) => ({ ...prev, clientId: id }))}
              clients={clients}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
