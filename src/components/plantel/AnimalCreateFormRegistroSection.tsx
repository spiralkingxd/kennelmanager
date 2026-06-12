import React from 'react';
import { FormData } from './AnimalCreateFormConstants';

interface AnimalCreateFormRegistroSectionProps {
  form: FormData;
  update: (field: string, value: any) => void;
}

export function AnimalCreateFormRegistroSection({ form, update }: AnimalCreateFormRegistroSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-3">Registro e Identificação</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Microchip</label>
          <input type="text" value={form.microchip} onChange={e => update('microchip', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="000000000000000" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Nº Registro</label>
          <input type="text" value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="CBKC-12345" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">Nº Pedigree</label>
          <input type="text" value={form.pedigreeNumber} onChange={e => update('pedigreeNumber', e.target.value)}
            className="h-10 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="PKC-98765" />
        </div>
      </div>
    </section>
  );
}
