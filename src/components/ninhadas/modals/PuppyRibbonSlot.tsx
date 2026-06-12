import React from 'react';
import { Palette, Trash2, Heart } from 'lucide-react';
import { RIBBON_COLORS, SEX_OPTIONS } from './LitterModal.constants';
import type { PuppySlot } from './LitterModal.types';

interface PuppyRibbonSlotProps {
  key?: any;
  index: number;
  slot: PuppySlot;
  onChange: (slot: PuppySlot) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function PuppyRibbonSlot({
  index,
  slot,
  onChange,
  onRemove,
  canRemove,
}: PuppyRibbonSlotProps) {
  const ribbon = RIBBON_COLORS.find((r) => r.value === slot.ribbonColor);

  const inputClass = (base: string) =>
    `${base} ${slot.isDead ? 'opacity-30 pointer-events-none' : ''}`;

  return (
    <div className={`flex items-center gap-2 rounded-lg p-2.5 border transition-all ${
      slot.isDead
        ? 'bg-red-950/20 border-red-900/30'
        : 'bg-zinc-800/30 border-zinc-800/50 hover:border-zinc-700'
    }`}>
      <span className={`text-xs font-bold w-7 shrink-0 text-center ${
        slot.isDead ? 'text-red-500' : 'text-zinc-500'
      }`}>#{index + 1}</span>

      <div className={`relative shrink-0 ${inputClass('')}`}>
        <select
          value={slot.ribbonColor}
          onChange={(e) => onChange({ ...slot, ribbonColor: e.target.value })}
          disabled={slot.isDead}
          className="h-9 w-28 rounded-lg border border-zinc-700 bg-zinc-900 pl-8 pr-2 text-xs text-zinc-200 appearance-none cursor-pointer focus:border-brand-500 focus:outline-none disabled:opacity-30"
        >
          <option value="">Sem fita</option>
          {RIBBON_COLORS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {ribbon && (
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 flex h-4 w-4 rounded-full border border-zinc-600"
            style={{ backgroundColor: ribbon.color }} />
        )}
        {!ribbon && (
          <Palette size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        )}
      </div>

      <select
        value={slot.sex}
        onChange={(e) => onChange({ ...slot, sex: e.target.value })}
        disabled={slot.isDead}
        className={`h-9 w-24 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-200 appearance-none cursor-pointer focus:border-brand-500 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        {SEX_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <input
        type="text"
        value={slot.name}
        onChange={(e) => onChange({ ...slot, name: e.target.value })}
        disabled={slot.isDead}
        placeholder="Nome (opcional)"
        className="h-9 flex-1 min-w-0 rounded-lg border border-zinc-700 bg-zinc-900/50 px-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
      />

      <input
        type="time"
        value={slot.birthTime || ''}
        onChange={(e) => onChange({ ...slot, birthTime: e.target.value })}
        disabled={slot.isDead}
        className="h-9 w-24 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-200 focus:border-brand-500 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed"
      />

      <label className={`flex items-center gap-1.5 shrink-0 cursor-pointer select-none ${
        slot.isDead ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
      } transition-colors`}>
        <input
          type="checkbox"
          checked={slot.isDead || false}
          onChange={(e) => onChange({ ...slot, isDead: e.target.checked })}
          className="rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500 focus:ring-offset-0"
        />
        <Heart size={12} className={slot.isDead ? '' : 'opacity-0'} />
        <span className="text-xs font-medium">Morto</span>
      </label>

      {canRemove && (
        <button type="button" onClick={onRemove}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-red-900/30 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
