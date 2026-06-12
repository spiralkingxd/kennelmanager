import React from 'react';
import { SEX_OPTIONS, SIZE_OPTIONS, STATUS_OPTIONS, FormData } from './AnimalCreateFormConstants';
import { DateInput } from '../../shared/components/DateInput';

interface AnimalCreateFormBasicSectionProps {
  form: FormData;
  update: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (cb: (prev: Record<string, string>) => Record<string, string>) => void;
}

export function AnimalCreateFormBasicSection({ form, update, fieldErrors, setFieldErrors }: AnimalCreateFormBasicSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-3">Dados Básicos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Nome *</label>
            <input type="text" value={form.name} onChange={e => { update('name', e.target.value); setFieldErrors(prev => ({...prev, name: ''})); }}
              className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Nome do animal" />
            {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Raça *</label>
          <input type="text" value={form.breed} onChange={e => { update('breed', e.target.value); setFieldErrors(prev => ({...prev, breed: ''})); }}
              className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Ex: Golden Retriever" />
            {fieldErrors.breed && <p className="text-red-400 text-xs mt-1">{fieldErrors.breed}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Sexo</label>
          <select value={form.sex} onChange={e => update('sex', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {SEX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Porte</label>
          <select value={form.size} onChange={e => update('size', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Cor</label>
          <input type="text" value={form.color} onChange={e => update('color', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Ex: Caramelo" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Peso (kg)</label>
          <input type="number" step="0.1" value={form.weight} onChange={e => { update('weight', e.target.value); setFieldErrors(prev => ({...prev, weight: ''})); }}
              className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="25.5" />
            {fieldErrors.weight && <p className="text-red-400 text-xs mt-1">{fieldErrors.weight}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Data de Nascimento</label>
           <DateInput value={form.birthDate} onChange={e => update('birthDate', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Status</label>
          <select value={form.status} onChange={e => update('status', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
