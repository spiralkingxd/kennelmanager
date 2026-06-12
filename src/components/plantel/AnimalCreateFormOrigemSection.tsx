import React from 'react';
import { FormData } from './AnimalCreateFormConstants';
import { DateInput } from '../../shared/components/DateInput';

interface AnimalCreateFormOrigemSectionProps {
  form: FormData;
  update: (field: string, value: any) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (cb: (prev: Record<string, string>) => Record<string, string>) => void;
}

export function AnimalCreateFormOrigemSection({ form, update, fieldErrors, setFieldErrors }: AnimalCreateFormOrigemSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-3">Origem e Aquisição</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Origem</label>
          <input type="text" value={form.origin} onChange={e => update('origin', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Ex: Canil XYZ" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Criador</label>
          <input type="text" value={form.breeder} onChange={e => update('breeder', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Nome do criador" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Data de Aquisição</label>
           <DateInput value={form.purchaseDate} onChange={e => update('purchaseDate', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Preço de Aquisição (R$)</label>
          <input type="number" step="0.01" value={form.purchasePrice} onChange={e => { update('purchasePrice', e.target.value); setFieldErrors(prev => ({...prev, purchasePrice: ''})); }}
              className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="1500.00" />
            {fieldErrors.purchasePrice && <p className="text-red-400 text-xs mt-1">{fieldErrors.purchasePrice}</p>}
        </div>
      </div>
    </section>
  );
}
