import { Loader2 } from 'lucide-react';
import { Modal } from '../plantel/modals/Modal';
import { FormField, SelectField } from '../plantel/modals/FormFields';
import { HealthRecordType, HEALTH_TYPE_OPTIONS } from './types';

interface Animal {
  id: string;
  name: string;
  breed?: string;
}

interface NewHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    type: HealthRecordType;
    animalId: string;
    date: string;
    detail: string;
  };
  onFormChange: (field: string, value: string) => void;
  animals: Animal[];
  saving: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function NewHealthRecordModal({
  isOpen,
  onClose,
  form,
  onFormChange,
  animals,
  saving,
  error,
  onSubmit,
}: NewHealthRecordModalProps) {
  const currentTypeOption = HEALTH_TYPE_OPTIONS.find(o => o.value === form.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Registro de Saúde" size="md">
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>
        )}

        <SelectField
          label="Tipo de Registro"
          value={form.type}
          onChange={(e: any) => onFormChange('type', e.target.value as HealthRecordType)}
          options={HEALTH_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Animal *</label>
          <select
            value={form.animalId}
            onChange={(e: any) => onFormChange('animalId', e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">Selecione um animal...</option>
            {animals.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}{a.breed ? ` (${a.breed})` : ''}</option>
            ))}
          </select>
          {animals.length === 0 && (
            <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
              <Loader2 size={12} className="animate-spin" /> Carregando animais...
            </span>
          )}
        </div>

        <FormField
          label={currentTypeOption?.detailLabel || 'Detalhes'}
          placeholder={currentTypeOption?.detailPlaceholder}
          value={form.detail}
          onChange={(e: any) => onFormChange('detail', e.target.value)}
          type={form.type === 'weight' ? 'number' : 'text'}
          step={form.type === 'weight' ? '0.1' : undefined}
        />

        <FormField
          label="Data"
          type="date"
          value={form.date}
          onChange={(e: any) => onFormChange('date', e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSubmit}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando...</>
            ) : 'Criar Registro'}
          </button>
        </div>
      </div>
    </Modal>
  );
}