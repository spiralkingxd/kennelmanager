import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, SelectField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

const EXAM_TYPE_OPTIONS = [
  { value: 'BLOOD_TEST', label: 'Exame de Sangue' },
  { value: 'XRAY', label: 'Raio-X' },
  { value: 'ULTRASOUND', label: 'Ultrassom' },
  { value: 'PROGESTERONE', label: 'Progesterona' },
  { value: 'OFA', label: 'OFA' },
  { value: 'BRUCELLOSIS', label: 'Brucelose' },
  { value: 'HIP_DYSPLASIA', label: 'Displasia do Quadril' },
  { value: 'ELBOW_DYSPLASIA', label: 'Displasia do Cotovelo' },
  { value: 'OTHER', label: 'Outro' },
];

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
  exam?: any | null;
}

export function ExamModal({ isOpen, onClose, onSaved, animalId, exam }: ExamModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!exam;

  useEffect(() => {
    if (isOpen) {
      if (exam) {
        setForm({
          type: exam.type || 'OTHER',
          date: exam.date ? exam.date.slice(0, 10) : '',
          result: exam.result || '',
          resultFileUrl: exam.result_file_url || '',
          vetName: exam.vet_name || '',
          clinic: exam.clinic || '',
          isPreReproduction: exam.is_pre_reproduction || false,
          notes: exam.notes || '',
        });
      } else {
        setForm({ type: 'BLOOD_TEST', date: '', result: '', resultFileUrl: '', vetName: '', clinic: '', isPreReproduction: false, notes: '' });
      }
      setError(null);
    }
  }, [isOpen, exam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.date) {
      setError('Data é obrigatória');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId,
        type: form.type,
        date: form.date,
        result: form.result || null,
        resultFileUrl: form.resultFileUrl || null,
        vetName: form.vetName || null,
        clinic: form.clinic || null,
        isPreReproduction: form.isPreReproduction,
        notes: form.notes || null,
      };
      const url = isEdit ? `/health/exams/${exam.id}` : `/health/${animalId}/exams`;
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));
  const setCheck = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.checked }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Exame' : 'Registrar Exame'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Tipo de Exame *" value={form.type} onChange={set('type')} options={EXAM_TYPE_OPTIONS} />
          <FormField label="Data de Realização *" type="date" value={form.date} onChange={set('date')} required />
          <FormField label="Resultado" value={form.result} onChange={set('result')} placeholder="Ex: Normal, Alterado, Pendente..." />
          <FormField label="Link do Arquivo (PDF)" value={form.resultFileUrl} onChange={set('resultFileUrl')} placeholder="https://..." />
          <FormField label="Veterinário" value={form.vetName} onChange={set('vetName')} />
          <FormField label="Clínica" value={form.clinic} onChange={set('clinic')} />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
          <input type="checkbox" checked={form.isPreReproduction} onChange={setCheck('isPreReproduction')}
            className="rounded border-zinc-600 bg-zinc-800 text-brand-500 focus:ring-brand-500" />
          Exame pré-reprodutivo
        </label>
        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} />
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}


