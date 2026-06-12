import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { FormField, SelectField, TextAreaField } from './FormFields';
import { ChevronDown, Search, Dog } from 'lucide-react';
import { apiFetch } from '../../../shared/utils/apiFetch';

const INSEMINATION_OPTIONS = [
  { value: 'NATURAL', label: 'Natural' },
  { value: 'ARTIFICIAL_FRESH', label: 'IA - Sêmen Fresco' },
  { value: 'ARTIFICIAL_REFRIGERATED', label: 'IA - Sêmen Refrigerado' },
  { value: 'ARTIFICIAL_FROZEN', label: 'IA - Sêmen Congelado' },
];

interface AnimalOption {
  id: string;
  name: string;
  breed: string | null;
  sex: string;
}

interface MaleSearchProps {
  value: string;
  onChange: (id: string) => void;
  animals: AnimalOption[];
}

function MaleSearch({ value, onChange, animals }: MaleSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const maleAnimals = animals.filter((a) => a.sex === 'MALE');
  const filtered = maleAnimals.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      (a.breed?.toLowerCase().includes(query.toLowerCase()))
  );
  const selected = maleAnimals.find((a) => a.id === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Macho (Pai)</label>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Macho (Pai): ${selected ? selected.name : 'Selecione o macho...'}`}
          className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-900/50 px-3 text-sm text-zinc-200 hover:border-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <Dog size={14} className="shrink-0 text-brand-500" />
              <span>{selected.name}</span>
              {selected.breed && <span className="text-xs text-zinc-500">({selected.breed})</span>}
            </span>
          ) : (
            <span className="text-zinc-500">Selecione o macho...</span>
          )}
          <ChevronDown size={16} className={`shrink-0 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div role="listbox" aria-label="Opções de machos" className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 overflow-hidden">
            <div className="relative border-b border-zinc-800">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar macho..."
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none" autoFocus />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-zinc-500">Nenhum macho encontrado</div>
              ) : (
                filtered.map((animal) => (
                  <button key={animal.id} type="button"
                    role="option"
                    aria-selected={animal.id === value}
                    onClick={() => { onChange(animal.id); setOpen(false); setQuery(''); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-zinc-800 ${animal.id === value ? 'bg-brand-500/10 text-brand-400' : 'text-zinc-300'}`}
                  >
                    <Dog size={16} className="shrink-0 text-zinc-500" />
                    <span className="font-medium">{animal.name}</span>
                    {animal.breed && <span className="text-xs text-zinc-500">({animal.breed})</span>}
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

interface MatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  mating?: any | null;
  allAnimals?: AnimalOption[];
}

export function MatingModal({ isOpen, onClose, onSaved, animalId, mating, allAnimals = [] }: MatingModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animals, setAnimals] = useState<AnimalOption[]>(allAnimals);
  const isEdit = !!mating;

  // Fetch animals if not provided
  useEffect(() => {
    if (allAnimals.length === 0 && isOpen) {
      apiFetch('/animals?limit=1000')
        .then(json => {
          if (json.success && json.data) {
            setAnimals(json.data.map((a: any) => ({ id: a.id, name: a.name, breed: a.breed, sex: a.sex })));
          }
        })
        .catch(console.error);
    }
  }, [isOpen, allAnimals.length]);

  useEffect(() => {
    if (isOpen) {
      if (mating) {
        setForm({
          maleId: mating.male_id || '',
          type: mating.type || 'NATURAL',
          date: mating.date ? mating.date.slice(0, 10) : '',
          result: mating.result || '',
          notes: mating.notes || '',
        });
      } else {
        setForm({ maleId: '', type: 'NATURAL', date: '', result: '', notes: '' });
      }
      setError(null);
    }
  }, [isOpen, mating]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.date) { setError('Data é obrigatória'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        femaleId: animalId, maleId: form.maleId || null, type: form.type,
        date: form.date, result: form.result || null, notes: form.notes || null,
      };
      const url = isEdit ? `/health/matings/${mating.id}` : `/health/${animalId}/matings`;
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Cobertura' : 'Nova Cobertura'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MaleSearch value={form.maleId} onChange={(id) => setForm((p: any) => ({ ...p, maleId: id }))} animals={animals} />
          <SelectField label="Tipo de Cobertura" value={form.type} onChange={set('type')} options={INSEMINATION_OPTIONS} />
          <FormField label="Data *" type="date" value={form.date} onChange={set('date')} required />
          <FormField label="Resultado" value={form.result} onChange={set('result')} placeholder="Ex: Prenhez confirmada, Negativo" />
        </div>
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={2} />
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


