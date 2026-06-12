import { X, Heart, Activity, Baby, Search, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Animal } from './types';
import { apiFetch } from '../../shared/utils/apiFetch';

// ─── Constants ─────────────────────────────────────────────────────────────────

const MATING_TYPES = [
  { value: 'NATURAL', label: 'Natural' },
  { value: 'ARTIFICIAL_FRESH', label: 'IA - Sêmen Fresco' },
  { value: 'ARTIFICIAL_REFRIGERATED', label: 'IA - Sêmen Refrigerado' },
  { value: 'ARTIFICIAL_FROZEN', label: 'IA - Sêmen Congelado' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── NovoEventoModal ──────────────────────────────────────────────────────────

interface NovoEventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  allAnimals: Animal[];
  selectedEventType: string | null;
  selectedFemale: Animal | null;
  onEventTypeSelect: (type: string) => void;
  onFemaleSelect: (id: string) => void;
  onSave: () => void;
  onBack: () => void;
}

export function NovoEventoModal({
  isOpen, onClose, allAnimals, selectedEventType, selectedFemale,
  onEventTypeSelect, onFemaleSelect, onSave, onBack,
}: NovoEventoModalProps) {
  // ─── Mating form state ───────────────────────────────────────────────────
  const [matingDate, setMatingDate] = useState(todayISO());
  const [selectedMale, setSelectedMale] = useState<Animal | null>(null);
  const [matingType, setMatingType] = useState('NATURAL');
  const [matingResult, setMatingResult] = useState('');
  const [maleSearch, setMaleSearch] = useState('');

  // ─── Gestation form state ────────────────────────────────────────────────
  const [gestationStartDate, setGestationStartDate] = useState(todayISO());
  const [gestationExpectedDate, setGestationExpectedDate] = useState('');

  // ─── UI state ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ─── Reset state when modal opens ────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setMatingDate(todayISO());
      setSelectedMale(null);
      setMatingType('NATURAL');
      setMatingResult('');
      setMaleSearch('');
      setGestationStartDate(todayISO());
      setGestationExpectedDate('');
      setSubmitting(false);
      setFormError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // ─── Derived data ────────────────────────────────────────────────────────
  const maleAnimals = allAnimals.filter(a => a.sex === 'MALE');
  const filteredMales = maleSearch
    ? maleAnimals.filter(m => m.name.toLowerCase().includes(maleSearch.toLowerCase()))
    : [];

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleMatingSubmit = async () => {
    if (!selectedFemale || !selectedMale) {
      setFormError('Selecione a fêmea e o macho para registrar a cobertura.');
      return;
    }
    if (!matingDate) {
      setFormError('Informe a data da cobertura.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const json = await apiFetch(`/health/${selectedFemale.id}/matings`, {
        method: 'POST',
        body: JSON.stringify({
          femaleId: selectedFemale.id,
          maleId: selectedMale.id,
          type: matingType,
          date: matingDate,
          result: matingResult || null,
        }),
      });

      if (json.success) {
        setSuccess(true);
        setTimeout(() => { onSave(); }, 1000);
      } else {
        setFormError(json.message || 'Erro ao registrar cobertura.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Erro de conexão ao servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGestationSubmit = async () => {
    if (!selectedFemale) return;
    if (!gestationStartDate) {
      setFormError('Informe a data de início da gestação.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const json = await apiFetch(`/health/${selectedFemale.id}/gestations`, {
        method: 'POST',
        body: JSON.stringify({
          animalId: selectedFemale.id,
          startDate: gestationStartDate,
          expectedBirthDate: gestationExpectedDate || null,
          isActive: true,
        }),
      });

      if (json.success) {
        setSuccess(true);
        setTimeout(() => { onSave(); }, 1000);
      } else {
        setFormError(json.message || 'Erro ao registrar gestação.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Erro de conexão ao servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Novo Evento Reprodutivo</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          {!selectedEventType ? (
            <>
              <p className="text-sm text-zinc-400">Selecione o tipo de evento:</p>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => onEventTypeSelect('heat_cycle')} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-pink-500/50 transition-all text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20 border border-pink-500/30">
                    <Heart size={20} className="text-pink-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Registrar Cio</p>
                    <p className="text-xs text-zinc-500">Marcar o início de um novo ciclo de cio</p>
                  </div>
                </button>
                <button onClick={() => onEventTypeSelect('mating')} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-amber-500/50 transition-all text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <Activity size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Registrar Cobertura</p>
                    <p className="text-xs text-zinc-500">Registrar uma cobertura/montação</p>
                  </div>
                </button>
                <button onClick={() => onEventTypeSelect('gestation')} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 hover:border-purple-500/50 transition-all text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Baby size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Registrar Gestação</p>
                    <p className="text-xs text-zinc-500">Confirmar uma nova gestação</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {allAnimals.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                </div>
              ) : (
                <>
                  {/* Female selection */}
                  <p className="text-sm text-zinc-400">Selecione a fêmea:</p>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-zinc-700 rounded-xl bg-zinc-800/30 p-1.5">
                    {allAnimals.filter(a => a.sex === 'FEMALE').map((animal) => (
                      <button key={animal.id} onClick={() => onFemaleSelect(animal.id)} className={`flex w-full items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${selectedFemale?.id === animal.id ? 'bg-brand-500/20 border border-brand-500/50' : 'hover:bg-zinc-800 border border-transparent'}`}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-300 text-sm font-bold">
                          {animal.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate">{animal.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{animal.breed}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* ─── Cobertura (Mating) Form ───────────────────────────────── */}
                  {selectedFemale && selectedEventType === 'mating' && !success && (
                    <div className="space-y-4 pt-3 border-t border-zinc-800">
                      <p className="text-sm font-medium text-amber-400 flex items-center gap-2">
                        <Activity size={16} />
                        Registrar Cobertura para <span className="font-bold text-white">{selectedFemale.name}</span>
                      </p>

                      {formError && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-800/50 px-3 py-2">
                          <AlertTriangle size={14} className="text-red-400 shrink-0" />
                          <span className="text-xs text-red-300">{formError}</span>
                        </div>
                      )}

                      {/* Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Data da Cobertura *</label>
                        <input
                          type="date"
                          value={matingDate}
                          onChange={(e) => setMatingDate(e.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Male selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Macho *</label>
                        <div className="relative">
                          {selectedMale ? (
                            <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-brand-500/50 bg-brand-500/10">
                              <span className="text-sm text-brand-300 font-medium truncate">{selectedMale.name}</span>
                              <button
                                type="button"
                                onClick={() => { setSelectedMale(null); setMaleSearch(''); }}
                                className="text-zinc-500 hover:text-zinc-300 shrink-0 ml-2"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                <Search size={14} />
                              </div>
                              <input
                                type="text"
                                placeholder="Buscar macho..."
                                value={maleSearch}
                                onChange={(e) => setMaleSearch(e.target.value)}
                                className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-9 pr-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                          )}
                        </div>
                        {maleSearch && !selectedMale && (
                          <div className="max-h-36 overflow-y-auto space-y-0.5 rounded-lg border border-zinc-700 bg-zinc-800 p-1">
                            {filteredMales.length === 0 ? (
                              <p className="text-xs text-zinc-500 py-2 px-2">Nenhum macho encontrado</p>
                            ) : (
                              filteredMales.map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => { setSelectedMale(m); setMaleSearch(''); }}
                                  className="flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-300 hover:bg-zinc-700 transition-colors text-left"
                                >
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-zinc-400 text-xs font-bold">
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium truncate">{m.name}</span>
                                  {m.breed && <span className="text-zinc-500 text-xs shrink-0">({m.breed})</span>}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Tipo de Cobertura</label>
                        <select
                          value={matingType}
                          onChange={(e) => setMatingType(e.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          {MATING_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Result */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Resultado <span className="text-zinc-600">(opcional)</span></label>
                        <input
                          type="text"
                          placeholder="Ex: Cobertura confirmada, prenhez positiva..."
                          value={matingResult}
                          onChange={(e) => setMatingResult(e.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onBack} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
                          Voltar
                        </button>
                        <button
                          onClick={handleMatingSubmit}
                          disabled={submitting || !selectedMale}
                          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting && <Loader2 size={14} className="animate-spin" />}
                          {submitting ? 'Salvando...' : 'Salvar Cobertura'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Gestação (Gestation) Form ──────────────────────────────── */}
                  {selectedFemale && selectedEventType === 'gestation' && !success && (
                    <div className="space-y-4 pt-3 border-t border-zinc-800">
                      <p className="text-sm font-medium text-purple-400 flex items-center gap-2">
                        <Baby size={16} />
                        Registrar Gestação para <span className="font-bold text-white">{selectedFemale.name}</span>
                      </p>

                      {formError && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-800/50 px-3 py-2">
                          <AlertTriangle size={14} className="text-red-400 shrink-0" />
                          <span className="text-xs text-red-300">{formError}</span>
                        </div>
                      )}

                      {/* Start date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Data de Início *</label>
                        <input
                          type="date"
                          value={gestationStartDate}
                          onChange={(e) => setGestationStartDate(e.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Expected birth date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-400">Data Prevista de Parto <span className="text-zinc-600">(opcional)</span></label>
                        <input
                          type="date"
                          value={gestationExpectedDate}
                          onChange={(e) => setGestationExpectedDate(e.target.value)}
                          className="h-9 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onBack} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
                          Voltar
                        </button>
                        <button
                          onClick={handleGestationSubmit}
                          disabled={submitting}
                          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting && <Loader2 size={14} className="animate-spin" />}
                          {submitting ? 'Salvando...' : 'Salvar Gestação'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─── Success state ─────────────────────────────────────────── */}
                  {selectedFemale && (selectedEventType === 'mating' || selectedEventType === 'gestation') && success && (
                    <div className="flex flex-col items-center gap-3 py-6 border-t border-zinc-800">
                      <CheckCircle size={44} className="text-emerald-400" />
                      <p className="text-base font-semibold text-emerald-300">
                        {selectedEventType === 'mating' ? 'Cobertura registrada com sucesso!' : 'Gestação registrada com sucesso!'}
                      </p>
                      <p className="text-xs text-zinc-500">Fechando...</p>
                    </div>
                  )}

                  {/* ─── Bottom buttons (heat_cycle only — quick save) ──────────── */}
                  {selectedEventType === 'heat_cycle' && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                      <button onClick={onBack} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
                        Voltar
                      </button>
                      <button onClick={onSave} disabled={!selectedFemale} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        Confirmar
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
