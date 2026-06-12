import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';
import { ClientOption } from './types';

export function ClientSearch({
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
      (c.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(query.toLowerCase())
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
