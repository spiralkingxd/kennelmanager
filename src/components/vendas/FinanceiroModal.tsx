import React from 'react';
import { useState, useEffect } from 'react';
import { X, Dog, Search, ChevronDown } from 'lucide-react';
import { positiveNumberString } from '../../shared/validation/schemas';
import { apiFetch } from '../../shared/utils/apiFetch';
import { DateInput } from '../../shared/components/DateInput';

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
];

const CATEGORY_OPTIONS = [
  { value: 'FOOD', label: 'Alimentação' },
  { value: 'VET', label: 'Veterinário' },
  { value: 'VACCINES', label: 'Vacinas' },
  { value: 'EXAMS', label: 'Exames' },
  { value: 'MEDICATION', label: 'Medicamentos' },
  { value: 'REPRODUCTION', label: 'Reprodução' },
  { value: 'EXHIBITION', label: 'Exposições' },
  { value: 'INFRASTRUCTURE', label: 'Infraestrutura' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'LABOR', label: 'Mão de Obra' },
  { value: 'OTHER', label: 'Outro' },
];

const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Pago' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

interface AnimalOption {
  id: string;
  name: string;
  breed: string | null;
}

function AnimalSearch({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [animals, setAnimals] = useState<AnimalOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && animals.length === 0) {
      setLoading(true);
      apiFetch('/animals?limit=500')
        .then(json => {
          if (json.success) setAnimals(json.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, animals.length]);

  const filtered = animals.filter(a =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    (a.breed || '').toLowerCase().includes(query.toLowerCase())
  );
  const selected = animals.find(a => a.id === value);

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Vincular Animal</label>
      <button type="button" onClick={() => setOpen(!open)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Vincular Animal: ${selected ? selected.name : 'Nenhum (opcional)'}`}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 hover:border-zinc-600 transition-all"
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <Dog size={14} className="text-brand-500" />
            <span>{selected.name}</span>
            {selected.breed && <span className="text-xs text-zinc-500">({selected.breed})</span>}
          </span>
        ) : (
          <span className="text-zinc-500">Nenhum (opcional)</span>
        )}
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="listbox" aria-label="Opções de animais" className="absolute z-50 mt-1 top-full w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="relative border-b border-zinc-800">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar animal..." className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none" autoFocus />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4 text-sm text-zinc-500">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-4 text-sm text-zinc-500">Nenhum animal encontrado</div>
            ) : (
              <>
                <button type="button" role="option" aria-selected={false} onClick={() => { onChange(''); setOpen(false); setQuery(''); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">
                  <X size={14} /> Sem vínculo
                </button>
                {filtered.map((a) => (
                  <button key={a.id} type="button" role="option" aria-selected={a.id === value} onClick={() => { onChange(a.id); setOpen(false); setQuery(''); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800 ${a.id === value ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-300'}`}
                  >
                    <Dog size={16} className="text-zinc-500" />
                    <span className="font-medium">{a.name}</span>
                    {a.breed && <span className="text-xs text-zinc-500">({a.breed})</span>}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FinanceiroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction?: any | null;
}

export function FinanceiroModal({ isOpen, onClose, onSaved, transaction }: FinanceiroModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = !!transaction;

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setForm({
          type: transaction.type || 'INCOME',
          category: transaction.category || 'OTHER',
          amount: transaction.amount || '',
          date: transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
          description: transaction.description || '',
          status: transaction.status || 'PAID',
          animalId: transaction.animal_id || '',
        });
      } else {
        setForm({
          type: 'INCOME', category: 'OTHER', amount: '',
          date: new Date().toISOString().slice(0, 10), description: '',
          status: 'PAID', animalId: '',
        });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, transaction]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const amountParsed = parseFloat(form.amount);
    if (isNaN(amountParsed) || amountParsed <= 0) {
      setFieldErrors(prev => ({ ...prev, amount: 'Valor deve ser um número positivo' }));
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        type: form.type,
        category: form.category,
        amount: amountParsed,
        date: form.date,
        description: form.description || null,
        status: form.status,
      };
      if (form.animalId) payload.animalId = form.animalId;

      const url = isEdit ? `/financial/${transaction.id}` : '/financial';
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
          <button onClick={onClose} aria-label="Fechar modal" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tipo *</label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm((p: any) => ({ ...p, type: opt.value }))}
                    className={`flex-1 h-10 rounded-xl border text-sm font-bold transition-all ${
                      form.type === opt.value
                        ? opt.value === 'INCOME'
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                          : 'border-red-500/50 bg-red-500/10 text-red-400'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Categoria</label>
              <select value={form.category} onChange={set('category')}
                className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all">
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Valor (R$) *</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => { set('amount')(e); setFieldErrors(prev => ({...prev, amount: ''})); }} required
                className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" placeholder="0,00" />
              {fieldErrors.amount && <p className="text-red-400 text-xs mt-1">{fieldErrors.amount}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Data *</label>
               <DateInput value={form.date} onChange={set('date')} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Status</label>
              <select value={form.status} onChange={set('status')}
                className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all">
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <AnimalSearch value={form.animalId} onChange={(id) => setForm((p: any) => ({ ...p, animalId: id }))} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Descrição</label>
            <input type="text" value={form.description} onChange={set('description')}
              className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all" placeholder="Ex: Venda filhote, Consulta vet,..." />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Registrar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}