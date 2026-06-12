import React from 'react';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { FormField, SelectField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';
import { ParentSearch } from '../AnimalCreateFormGenealogiaSection';

interface AnimalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  dog: any;
}

export function AnimalEditModal({ isOpen, onClose, onSaved, dog }: AnimalEditModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingAnimals(true);
      apiFetch('/animals?limit=1000')
        .then((res) => { if (res.success) setAnimals(res.data); })
        .catch(() => {})
        .finally(() => setLoadingAnimals(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && dog) {
      setForm({
        name: dog.name || '',
        breed: dog.breed || '',
        color: dog.color || '',
        size: dog.size || 'MEDIUM',
        weight: dog.weight || '',
        birthDate: dog.birth_date ? dog.birth_date.slice(0, 10) : '',
        microchip: dog.microchip || '',
        registrationNumber: dog.registration_number || '',
        pedigreeNumber: dog.pedigree_number || '',
        origin: dog.origin || '',
        breeder: dog.breeder || '',
        purchaseDate: dog.purchase_date ? dog.purchase_date.slice(0, 10) : '',
        purchasePrice: dog.purchase_price || '',
        notes: dog.notes || '',
        status: dog.status || 'ACTIVE',
        sex: dog.sex || 'MALE',
        fatherId: dog.father_id || dog.fatherId || '',
        motherId: dog.mother_id || dog.motherId || '',
      });
      setError(null);
    }
  }, [isOpen, dog]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.breed) {
      setError('Nome e raça são obrigatórios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: any = { ...form };
      if (payload.weight) payload.weight = parseFloat(payload.weight);
      else delete payload.weight;
      if (payload.purchasePrice) payload.purchasePrice = parseFloat(payload.purchasePrice);
      else delete payload.purchasePrice;
      if (!payload.fatherId) delete payload.fatherId;
      if (!payload.motherId) delete payload.motherId;

      const json = await apiFetch(`/animals/${dog.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (json.success) {
        onSaved();
        onClose();
      } else {
        setError(json.message || 'Erro ao atualizar');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Ficha" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome" value={form.name} onChange={set('name')} required />
          <FormField label="Raça" value={form.breed} onChange={set('breed')} required />
          <FormField label="Cor" value={form.color} onChange={set('color')} />
          <SelectField label="Porte" value={form.size} onChange={set('size')} options={[
            { value: 'SMALL', label: 'Pequeno' },
            { value: 'MEDIUM', label: 'Médio' },
            { value: 'LARGE', label: 'Grande' },
            { value: 'GIANT', label: 'Gigante' },
          ]} />
          <FormField label="Peso (kg)" type="number" step="0.1" value={form.weight} onChange={set('weight')} />
          <FormField label="Data de Nascimento" type="date" value={form.birthDate} onChange={set('birthDate')} />
          <FormField label="Microchip" value={form.microchip} onChange={set('microchip')} />
          <FormField label="Nº Registro" value={form.registrationNumber} onChange={set('registrationNumber')} />
          <FormField label="Nº Pedigree" value={form.pedigreeNumber} onChange={set('pedigreeNumber')} />
          <SelectField label="Status" value={form.status} onChange={set('status')} options={[
            { value: 'ACTIVE', label: 'Ativo' },
            { value: 'INACTIVE', label: 'Inativo' },
            { value: 'DECEASED', label: 'Falecido' },
            { value: 'SOLD', label: 'Vendido' },
          ]} />
          <SelectField label="Sexo" value={form.sex} onChange={set('sex')} options={[
            { value: 'MALE', label: 'Macho' },
            { value: 'FEMALE', label: 'Fêmea' },
          ]} />
          {loadingAnimals ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              Carregando...
            </div>
          ) : (
            <>
              <ParentSearch
                value={form.motherId}
                onChange={(id) => setForm((prev: any) => ({ ...prev, motherId: id }))}
                animals={animals}
                sex="FEMALE"
                label="Mãe"
                placeholder="Selecionar mãe..."
              />
              <ParentSearch
                value={form.fatherId}
                onChange={(id) => setForm((prev: any) => ({ ...prev, fatherId: id }))}
                animals={animals}
                sex="MALE"
                label="Pai"
                placeholder="Selecionar pai..."
              />
            </>
          )}
          <FormField label="Origem" value={form.origin} onChange={set('origin')} />
          <FormField label="Criador" value={form.breeder} onChange={set('breeder')} />
          <FormField label="Data de Aquisição" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
          <FormField label="Valor de Aquisição (R$)" type="number" step="0.01" value={form.purchasePrice} onChange={set('purchasePrice')} />
        </div>

        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={3} />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


