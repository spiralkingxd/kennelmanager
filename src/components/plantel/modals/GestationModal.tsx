import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

interface GestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  gestation?: any | null;
  mode?: 'create' | 'birth';
}

export function GestationModal({ isOpen, onClose, onSaved, animalId, gestation, mode = 'create' }: GestationModalProps) {
  const isBirthMode = mode === 'birth';
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (gestation && isBirthMode) {
        setForm({
          actualBirthDate: new Date().toISOString().slice(0, 10),
          estimatedPuppies: gestation.estimated_puppies || '',
          notes: gestation.notes || '',
        });
      } else if (gestation) {
        setForm({
          startDate: gestation.start_date ? gestation.start_date.slice(0, 10) : '',
          expectedBirthDate: gestation.expected_birth_date ? gestation.expected_birth_date.slice(0, 10) : '',
          actualBirthDate: gestation.actual_birth_date ? gestation.actual_birth_date.slice(0, 10) : '',
          progressWeek: gestation.progress_week || 0,
          isActive: gestation.is_active !== false,
          notes: gestation.notes || '',
        });
      } else {
        setForm({ startDate: '', expectedBirthDate: '', actualBirthDate: '', progressWeek: 0, isActive: true, notes: '' });
      }
      setError(null);
    }
  }, [isOpen, gestation, isBirthMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isBirthMode && !form.startDate) { setError('Data de início é obrigatória'); return; }
    if (isBirthMode && !form.actualBirthDate) { setError('Data do parto é obrigatória'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = isBirthMode
        ? { actualBirthDate: form.actualBirthDate, estimatedPuppies: form.estimatedPuppies ? parseInt(form.estimatedPuppies) : null, isActive: false, notes: form.notes || null }
        : {
          animalId, startDate: form.startDate, expectedBirthDate: form.expectedBirthDate || null,
          actualBirthDate: form.actualBirthDate || null,
          progressWeek: parseInt(form.progressWeek) || 0, isActive: form.isActive, notes: form.notes || null,
        };

      const gestationId = gestation?.id;
      let url: string, method: string;
      if (gestationId) {
        url = `/health/gestations/${gestationId}`;
        method = 'PUT';
      } else {
        url = `/health/${animalId}/gestations`;
        method = 'POST';
      }

      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));
  const setNum = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  if (isBirthMode) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Registrar Parto" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
          <FormField label="Data do Parto *" type="date" value={form.actualBirthDate} onChange={set('actualBirthDate')} required />
          <FormField label="Número de Filhotes" type="number" value={form.estimatedPuppies} onChange={setNum('estimatedPuppies')} />
          <TextAreaField label="Observações do Parto" value={form.notes} onChange={set('notes')} rows={3} />
          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Registrar Parto'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={gestation ? 'Editar Gestação' : 'Registrar Gestação'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data de Início *" type="date" value={form.startDate} onChange={set('startDate')} required />
          <FormField label="Data Prevista do Parto" type="date" value={form.expectedBirthDate} onChange={set('expectedBirthDate')} />
          <FormField label="Data Real do Parto" type="date" value={form.actualBirthDate} onChange={set('actualBirthDate')} />
          <FormField label="Semana de Progresso" type="number" min="0" max="9" value={form.progressWeek} onChange={setNum('progressWeek')} />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev: any) => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-zinc-600 bg-zinc-800 text-brand-500 focus:ring-brand-500" />
          Gestação ativa
        </label>
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={2} />
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (gestation ? 'Atualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}


