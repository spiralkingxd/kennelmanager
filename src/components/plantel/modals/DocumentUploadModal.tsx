import React from 'react';
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { FormField, SelectField, TextAreaField } from './FormFields';
import { apiFetch } from '../../../shared/utils/apiFetch';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'PEDIGREE', label: 'Pedigree' },
  { value: 'CERTIFICATE', label: 'Certificado' },
  { value: 'EXAM_REPORT', label: 'Laudo de Exame' },
  { value: 'PURCHASE_CONTRACT', label: 'Contrato de Compra' },
  { value: 'SALE_CONTRACT', label: 'Contrato de Venda' },
  { value: 'PHOTO', label: 'Foto' },
  { value: 'OTHER', label: 'Outro' },
];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  animalId: string;
}

export function DocumentUploadModal({ isOpen, onClose, onSaved, animalId }: DocumentUploadModalProps) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: '', type: 'OTHER', filePath: '', description: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.filePath) { setError('Nome e caminho do arquivo são obrigatórios'); return; }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        animalId, name: form.name, type: form.type,
        filePath: form.filePath, description: form.description || null,
      };
      const json = await apiFetch('/documents', {
        method: 'POST', body: JSON.stringify(payload),
      });
      if (json.success) { onSaved(); onClose(); }
      else setError(json.message || 'Erro ao salvar');
    } catch { setError('Erro de conexão'); }
    finally { setSaving(false); }
  };

  const set = (field: string) => (e: any) => setForm((prev: any) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Documento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}
        <FormField label="Nome do Documento *" value={form.name} onChange={set('name')} required />
        <SelectField label="Tipo de Documento" value={form.type} onChange={set('type')} options={DOCUMENT_TYPE_OPTIONS} />
        <FormField label="Link/Caminho do Arquivo *" value={form.filePath} onChange={set('filePath')} placeholder="https://... ou /uploads/..." required />
        <TextAreaField label="Descrição" value={form.description} onChange={set('description')} rows={2} />
        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enviando...</> : 'Adicionar Documento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


