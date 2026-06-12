import React from 'react';

interface AnimalCreateFormObservacoesSectionProps {
  notes: string;
  update: (field: string, value: any) => void;
}

export function AnimalCreateFormObservacoesSection({ notes, update }: AnimalCreateFormObservacoesSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="text-lg font-bold text-white mb-6 border-b border-zinc-800 pb-3">Observações</h2>
      <textarea value={notes} onChange={e => update('notes', e.target.value)} rows={4}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-y"
        placeholder="Informações adicionais sobre o animal..." />
    </section>
  );
}
