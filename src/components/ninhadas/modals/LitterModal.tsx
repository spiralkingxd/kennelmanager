import React from 'react';
import { useState, useEffect, useReducer } from 'react';
import { Dog, Palette } from 'lucide-react';
import { Modal } from '../../plantel/modals/Modal';
import { FormField, SelectField, TextAreaField } from '../../plantel/modals/FormFields';
import { requiredSelectSchema } from '../../../shared/validation/schemas';
import { BIRTH_TYPE_OPTIONS, STATUS_OPTIONS } from './LitterModal.constants';
import { AnimalSearch } from './AnimalSearch';
import { PuppyRibbonSlot } from './PuppyRibbonSlot';
import type { LitterModalProps, AnimalOption, PuppySlot } from './LitterModal.types';
import { apiFetch } from '../../../shared/utils/apiFetch';

// Reducer do formulário: processa múltiplos dispatches em batch sequencialmente
// (corrige bug de React 18 batching onde setForm callbacks recebiam o mesmo prev stale)
function formReducer(state: any, action: any) {
  return { ...state, ...action };
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function LitterModal({ isOpen, onClose, onSaved, litter }: LitterModalProps) {
  const [form, dispatch] = useReducer(formReducer, {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [animals, setAnimals] = useState<AnimalOption[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [puppySlots, setPuppySlots] = useState<PuppySlot[]>([]);
  const isEdit = !!litter;

  // Carregar animais
  useEffect(() => {
    if (isOpen) {
      setLoadingAnimals(true);
      apiFetch('/animals')
        .then((res) => { if (res.success) setAnimals(res.data); })
        .catch(() => {})
        .finally(() => setLoadingAnimals(false));
    }
  }, [isOpen]);

  // Inicializar formulário
  useEffect(() => {
    if (isOpen) {
      if (litter) {
        dispatch({
          motherId: litter.mother_id || '',
          fatherId: litter.father_id || '',
          expectedDate: litter.expected_date ? litter.expected_date.slice(0, 10) : '',
          birthDate: litter.birth_date ? litter.birth_date.slice(0, 10) : '',
          birthType: litter.birth_type || 'NATURAL',
          status: litter.status || 'PLANNED',
          totalPuppies: litter.total_puppies != null ? String(litter.total_puppies) : '0',
          maleCount: litter.male_count != null ? String(litter.male_count) : '0',
          femaleCount: litter.female_count != null ? String(litter.female_count) : '0',
          notes: litter.notes || '',
        });
        // Carregar filhotes existentes ao editar (slots apenas, NÃO toca no form para não sobrescrever typing)
        apiFetch(`/puppies?litterId=${litter.id}`)
          .then((res) => {
            if (res.success && res.data.length > 0) {
              const existingSlots: PuppySlot[] = res.data.map((p: any) => ({
                id: p.id,
                ribbonColor: p.color || '',
                sex: p.sex || 'MALE',
                name: p.name || '',
                isDead: p.status === 'DEAD',
              }));
              setPuppySlots(existingSlots);
              // NÃO dispatch totalPuppies aqui: o usuário pode ter digitado
              // um novo valor enquanto o fetch estava em voo. Manter o valor
              // inicial de litter.total_puppies + digitação do usuário.
            }
          })
          .catch(() => {});
      } else {
        dispatch({
          motherId: '',
          fatherId: '',
          expectedDate: '',
          birthDate: '',
          birthType: 'NATURAL',
          status: 'PLANNED',
          totalPuppies: '0',
          maleCount: '0',
          femaleCount: '0',
          notes: '',
        });
        setPuppySlots([]);
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, litter]);

  // Auto-calcular totalPuppies a partir de maleCount + femaleCount
  useEffect(() => {
    const total = String((parseInt(form.maleCount) || 0) + (parseInt(form.femaleCount) || 0));
    dispatch({ totalPuppies: total });
  }, [form.maleCount, form.femaleCount]);

  // Sincronizar slots com total de filhotes
  useEffect(() => {
    const total = (parseInt(form.maleCount) || 0) + (parseInt(form.femaleCount) || 0);
    setPuppySlots((prev) => {
      if (prev.length === total) return prev;
      if (prev.length < total) {
        const added = Array.from({ length: total - prev.length }, () => ({
          ribbonColor: '',
          sex: 'MALE' as const,
          name: '',
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, total);
    });
  }, [form.maleCount, form.femaleCount]);

  const updatePuppySlot = (index: number, slot: PuppySlot) => {
    setPuppySlots((prev) => {
      const next = [...prev];
      next[index] = slot;
      return next;
    });
  };

  const removePuppySlot = (index: number) => {
    const slot = puppySlots[index];
    setPuppySlots((prev) => prev.filter((_, i) => i !== index));
    if (slot) {
      const field = slot.sex === 'MALE' ? 'maleCount' : 'femaleCount';
      const current = parseInt(form[field]) || 1;
      dispatch({ [field]: String(Math.max(0, current - 1)) });
    }
  };

  const autoFillSlots = () => {
    const males = parseInt(form.maleCount) || 0;
    const females = parseInt(form.femaleCount) || 0;
    const total = males + females;
    if (total === 0) return;
    setPuppySlots((prev) =>
      Array.from({ length: total }, (_, i) => ({
        id: prev[i]?.id, // preserva ID de filhote existente (edição)
        ribbonColor: prev[i]?.ribbonColor || '', // preserva cor existente ou deixa vazio
        sex: i < males ? 'MALE' : 'FEMALE',
        name: prev[i]?.name || '', // preserva nome se já existia
        isDead: prev[i]?.isDead || false, // preserva status mortalidade
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const motherResult = requiredSelectSchema('Selecione a mãe').safeParse(form.motherId);
    if (!motherResult.success) {
      setFieldErrors(prev => ({ ...prev, motherId: motherResult.error.issues[0].message }));
      return;
    }
    const fatherResult = requiredSelectSchema('Selecione o pai').safeParse(form.fatherId);
    if (!fatherResult.success) {
      setFieldErrors(prev => ({ ...prev, fatherId: fatherResult.error.issues[0].message }));
      return;
    }

    const males = parseInt(form.maleCount) || 0;
    const females = parseInt(form.femaleCount) || 0;

    setSaving(true);
    try {
      // 1. Criar/atualizar a ninhada
      const payload: Record<string, any> = {
        motherId: form.motherId,
        fatherId: form.fatherId,
        expectedDate: form.expectedDate || null,
        birthDate: form.birthDate || null,
        birthType: form.birthType,
        status: form.status,
        totalPuppies: males + females || undefined,
        maleCount: form.maleCount ? parseInt(form.maleCount) : undefined,
        femaleCount: form.femaleCount ? parseInt(form.femaleCount) : undefined,
        notes: form.notes || null,
      };

      const url = isEdit ? `/litters/${litter.id}` : '/litters';
      const method = isEdit ? 'PUT' : 'POST';
      const json = await apiFetch(url, { method, body: JSON.stringify(payload) });
      if (!json.success) { setError(json.message || 'Erro ao salvar'); setSaving(false); return; }

      const litterId = json.data?.id || litter?.id;

      // Auto-vincular gestação ativa da mãe (apenas na criação)
      if (!isEdit && litterId && form.motherId) {
        try {
          const healthRes = await apiFetch(`/health/${form.motherId}`);
          if (healthRes.success && healthRes.data?.gestations) {
            const activeGestation = healthRes.data.gestations.find(
              (g: any) => g.is_active && !g.actual_birth_date
            );
            if (activeGestation) {
              // Gestação ativa encontrada → vincular e finalizar
              await apiFetch(`/health/gestations/${activeGestation.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                  litterId,
                  isActive: false,
                  actualBirthDate: form.birthDate || new Date().toISOString().slice(0, 10),
                }),
              });
            } else {
              // Nenhuma gestação ativa → criar uma automaticamente
              const birthDate = form.birthDate || new Date().toISOString().slice(0, 10);
              const totalPuppies = (parseInt(form.maleCount) || 0) + (parseInt(form.femaleCount) || 0);
              const createRes = await apiFetch(`/health/${form.motherId}/gestations`, {
                method: 'POST',
                body: JSON.stringify({
                  animalId: form.motherId,
                  startDate: birthDate,
                  actualBirthDate: birthDate,
                  isActive: false,
                  estimatedPuppies: totalPuppies || null,
                  notes: 'Gestação registrada automaticamente a partir do cadastro de ninhada.',
                }),
              });
              // createGestationSchema não inclui litterId → vincular via PUT separado
              if (createRes.success && createRes.data?.id) {
                await apiFetch(`/health/gestations/${createRes.data.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({ litterId }),
                });
              }
            }
          }
        } catch {
          console.error('Falha ao vincular/criar gestação à ninhada');
        }
      }

      // 2. Salvar filhotes com base nos slots
      // IMPORTANTE: criar/atualizar filhote para CADA slot, mesmo sem cor
      // selecionada. A cor é opcional e fica como null no banco.
      // (Antigamente filtrava por cor e perdia filhotes não coloridos.)
      if (litterId && puppySlots.length > 0) {
        const promises = puppySlots.map((slot) => {
          const puppyData = {
            litterId,
            name: slot.name || null,
            sex: slot.sex,
            color: slot.ribbonColor || null,
            birthTime: slot.birthTime || null,
            status: slot.isDead ? 'DEAD' : 'AVAILABLE',
          };
          if (isEdit && slot.id) {
            // Edição: atualizar filhote existente
            return apiFetch(`/puppies/${slot.id}`, {
              method: 'PUT',
              body: JSON.stringify(puppyData),
            });
          }
          // Criação: novo filhote (também usado em edição quando slot é novo)
          return apiFetch('/puppies', {
            method: 'POST',
            body: JSON.stringify(puppyData),
          });
        });
        await Promise.all(promises);
      }

      onSaved();
      onClose();
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: any) => dispatch({ [field]: e.target.value });
  const setNum = (field: string) => (e: any) => dispatch({ [field]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Ninhada' : 'Nova Ninhada'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div role="alert" className="rounded-lg bg-red-500/10 border border-red-800 text-red-400 text-sm p-3">{error}</div>}

        {/* ── Pais ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <AnimalSearch label="Mãe (Dam) *" placeholder="Selecione a mãe..." value={form.motherId}
              onChange={(id) => { dispatch({ motherId: id }); setFieldErrors(prev => ({...prev, motherId: ''})); }} animals={animals} sex="FEMALE" />
            {fieldErrors.motherId && <p className="text-red-400 text-xs mt-1">{fieldErrors.motherId}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <AnimalSearch label="Pai (Sire) *" placeholder="Selecione o pai..." value={form.fatherId}
              onChange={(id) => { dispatch({ fatherId: id }); setFieldErrors(prev => ({...prev, fatherId: ''})); }} animals={animals} sex="MALE" />
            {fieldErrors.fatherId && <p className="text-red-400 text-xs mt-1">{fieldErrors.fatherId}</p>}
          </div>
        </div>

        {/* ── Datas e status ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data Prevista do Parto" type="date" value={form.expectedDate} onChange={set('expectedDate')} />
          <FormField label="Data do Nascimento" type="date" value={form.birthDate} onChange={set('birthDate')} />
          <SelectField label="Tipo de Parto" value={form.birthType} onChange={set('birthType')} options={BIRTH_TYPE_OPTIONS} />
          <SelectField label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
        </div>

        {/* ── Contagem de filhotes ── */}
        <div className="border-t border-zinc-800 pt-4">
          <h4 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
            <Dog size={16} className="text-brand-500" />
            Filhotes
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FormField label="Machos" type="number" min="0" value={form.maleCount} onChange={setNum('maleCount')} />
            <FormField label="Fêmeas" type="number" min="0" value={form.femaleCount} onChange={setNum('femaleCount')} />
          </div>
        </div>

        {/* ── Cores das Fitas ── */}
        {(parseInt(form.maleCount) || 0) + (parseInt(form.femaleCount) || 0) > 0 && (
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Palette size={16} className="text-brand-500" />
                Cores das Fitas
              </h4>
              <button type="button" onClick={autoFillSlots}
                className="text-xs text-brand-500 hover:text-brand-400 font-medium transition-colors">
                Preencher automaticamente
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Identifique cada filhote pela cor da fita. As fitas serão registradas como filhotes individuais no sistema.
            </p>
            <div className="space-y-2">
              {puppySlots.map((slot, i) => (
                <PuppyRibbonSlot
                  key={i}
                  index={i}
                  slot={slot}
                  onChange={(s) => updatePuppySlot(i, s)}
                  onRemove={() => removePuppySlot(i)}
                  canRemove={puppySlots.length > 1}
                />
              ))}
            </div>
          </div>
        )}

        <TextAreaField label="Observações" value={form.notes} onChange={set('notes')} rows={2} />

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-400 transition-colors disabled:opacity-50 flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : (isEdit ? 'Atualizar' : 'Registrar')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
