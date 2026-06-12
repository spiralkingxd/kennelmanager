import React, { useState } from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { apiFetch } from '../../shared/utils/apiFetch';
import { nameSchema } from '../../shared/validation/schemas';
import { initialForm, AnimalCreateFormProps } from './AnimalCreateFormConstants';
import { AnimalCreateFormBasicSection } from './AnimalCreateFormBasicSection';
import { AnimalCreateFormRegistroSection } from './AnimalCreateFormRegistroSection';
import { AnimalCreateFormGenealogiaSection } from './AnimalCreateFormGenealogiaSection';
import { AnimalCreateFormFotoSection } from './AnimalCreateFormFotoSection';
import { AnimalCreateFormOrigemSection } from './AnimalCreateFormOrigemSection';
import { AnimalCreateFormObservacoesSection } from './AnimalCreateFormObservacoesSection';

export function AnimalCreateForm({ onSuccess, onCancel }: AnimalCreateFormProps) {
  const [form, setForm] = useState({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const nameResult = nameSchema.safeParse(form.name.trim());
    if (!nameResult.success) {
      setFieldErrors(prev => ({ ...prev, name: nameResult.error.issues[0].message }));
      return;
    }

    if (!form.breed.trim()) {
      setFieldErrors(prev => ({ ...prev, breed: 'Raça é obrigatória' }));
      return;
    }

    if (form.weight) {
      const weightParsed = parseFloat(form.weight);
      if (isNaN(weightParsed) || weightParsed <= 0) {
        setFieldErrors(prev => ({ ...prev, weight: 'Peso deve ser um número positivo' }));
        return;
      }
    }

    if (form.purchasePrice) {
      const priceParsed = parseFloat(form.purchasePrice);
      if (isNaN(priceParsed) || priceParsed <= 0) {
        setFieldErrors(prev => ({ ...prev, purchasePrice: 'Preço deve ser um número positivo' }));
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        breed: form.breed.trim(),
        sex: form.sex,
        size: form.size,
        status: form.status,
      };

      if (form.color) payload.color = form.color;
      if (form.weight) payload.weight = parseFloat(form.weight);
      if (form.birthDate) payload.birthDate = form.birthDate;
      if (form.microchip) payload.microchip = form.microchip;
      if (form.registrationNumber) payload.registrationNumber = form.registrationNumber;
      if (form.pedigreeNumber) payload.pedigreeNumber = form.pedigreeNumber;
      if (form.photoUrl) payload.photoUrl = form.photoUrl;
      if (form.origin) payload.origin = form.origin;
      if (form.breeder) payload.breeder = form.breeder;
      if (form.purchaseDate) payload.purchaseDate = form.purchaseDate;
      if (form.purchasePrice) payload.purchasePrice = parseFloat(form.purchasePrice);
      if (form.notes) payload.notes = form.notes;
      if (form.fatherId) payload.fatherId = form.fatherId;
      if (form.motherId) payload.motherId = form.motherId;
      if (form.ownerId) payload.ownerId = form.ownerId;

      const data = await apiFetch('/animals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        onSuccess(data.data.id);
      } else {
        setError(data.message || 'Erro ao cadastrar animal');
      }
    } catch (err) {
      setError('Erro de conexão ao servidor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onCancel}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cadastrar Novo Animal</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Adicione um novo animal ao plantel</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimalCreateFormBasicSection
          form={form}
          update={update}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
        />

        <AnimalCreateFormGenealogiaSection
          form={form}
          update={update}
        />

        <AnimalCreateFormRegistroSection
          form={form}
          update={update}
        />

        <AnimalCreateFormFotoSection
          photoUrl={form.photoUrl}
          update={update}
        />

        <AnimalCreateFormOrigemSection
          form={form}
          update={update}
          fieldErrors={fieldErrors}
          setFieldErrors={setFieldErrors}
        />

        <AnimalCreateFormObservacoesSection
          notes={form.notes}
          update={update}
        />

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:opacity-70 transition-all">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Animal'}
          </button>
        </div>
      </form>
    </div>
  );
}
