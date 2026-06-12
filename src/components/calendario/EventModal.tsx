import { X, Dog, User, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { CalendarEvent, FormState, EventCategory } from './types';
import { CATEGORY_LABELS, CATEGORY_STYLES, ALL_CATEGORIES, COLOR_OPTIONS } from './constants';
import { SearchDropdown } from './SearchDropdown';
import { DateInput } from '../../shared/components/DateInput';

// ─── EventModal ──────────────────────────────────────────────────────────────

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'view';
  event: CalendarEvent | null;
  form: FormState;
  onUpdateForm: (field: keyof FormState, value: any) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onSwitchToEdit: () => void;
  saving: boolean;
  // Autocomplete
  animalResults: { id: string; name: string }[];
  clientResults: { id: string; name: string }[];
  showAnimalDropdown: boolean;
  showClientDropdown: boolean;
  onShowAnimalDropdown: (v: boolean) => void;
  onShowClientDropdown: (v: boolean) => void;
  searchLoading: 'animal' | 'client' | null;
  onSearchChange: (type: 'animal' | 'client', value: string) => void;
  onSelectItem: (type: 'animal' | 'client', id: string, name: string) => void;
}

export function EventModal({
  isOpen, onClose, mode, event, form, onUpdateForm,
  onSave, onDelete, onStatusUpdate, onSwitchToEdit, saving,
  animalResults, clientResults, showAnimalDropdown, showClientDropdown,
  onShowAnimalDropdown, onShowClientDropdown, searchLoading,
  onSearchChange, onSelectItem,
}: EventModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-start mb-6 shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === 'create' ? (event ? 'Editar Evento' : 'Criar Novo Evento') : 'Detalhes do Evento'}
            </h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
              <X size={24} />
            </button>
          </div>

          <div className="overflow-y-auto scrollbar-thin flex-1 pb-4">
            {mode === 'create' ? (
              /* CREATE / EDIT FORM */
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Título do Evento *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => onUpdateForm('title', e.target.value)}
                    placeholder="Ex: Consulta Veterinária, Novo Contrato..."
                    className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Data *</label>
                    <DateInput value={form.date} onChange={e => onUpdateForm('date', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Categoria *</label>
                    <select
                      value={form.category}
                      onChange={e => onUpdateForm('category', e.target.value)}
                      className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                    >
                      {ALL_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Horário Início</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={e => onUpdateForm('time', e.target.value)}
                      className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Horário Fim</label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={e => onUpdateForm('endTime', e.target.value)}
                      className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Cor (Opcional)</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c || 'none'}
                        type="button"
                        onClick={() => onUpdateForm('color', c)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'} ${c ? '' : 'bg-zinc-800 border-zinc-600'}`}
                        style={c ? { backgroundColor: c } : undefined}
                        title={c || 'Sem cor'}
                      />
                    ))}
                  </div>
                </div>

                <div>
                   <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">
                     Animal Relacionado (Opcional)
                     {form.animalId && <span className="text-emerald-400 ml-2">✓ selecionado</span>}
                   </label>
                   <div className="relative">
                     <Dog size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
                     <input
                       type="text"
                       value={form.animalName}
                       onChange={e => onSearchChange('animal', e.target.value)}
                       onFocus={() => { if (animalResults.length > 0) onShowAnimalDropdown(true); }}
                       onBlur={() => setTimeout(() => onShowAnimalDropdown(false), 200)}
                       placeholder="Digite o nome do animal..."
                       className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                     />
                     <SearchDropdown
                       results={animalResults}
                       show={showAnimalDropdown}
                       loading={searchLoading === 'animal'}
                       onSelect={(id, name) => onSelectItem('animal', id, name)}
                     />
                     {form.animalId && (
                       <button
                         type="button"
                         onMouseDown={() => { onUpdateForm('animalId', ''); onUpdateForm('animalName', ''); }}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                       >
                         <X size={14} />
                       </button>
                     )}
                   </div>
                </div>

                <div>
                   <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">
                     Cliente Relacionado (Opcional)
                     {form.clientId && <span className="text-emerald-400 ml-2">✓ selecionado</span>}
                   </label>
                   <div className="relative">
                     <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 z-10" />
                     <input
                       type="text"
                       value={form.clientName}
                       onChange={e => onSearchChange('client', e.target.value)}
                       onFocus={() => { if (clientResults.length > 0) onShowClientDropdown(true); }}
                       onBlur={() => setTimeout(() => onShowClientDropdown(false), 200)}
                       placeholder="Digite o nome do cliente..."
                       className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                     />
                     <SearchDropdown
                       results={clientResults}
                       show={showClientDropdown}
                       loading={searchLoading === 'client'}
                       onSelect={(id, name) => onSelectItem('client', id, name)}
                     />
                     {form.clientId && (
                       <button
                         type="button"
                         onMouseDown={() => { onUpdateForm('clientId', ''); onUpdateForm('clientName', ''); }}
                         className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                       >
                         <X size={14} />
                       </button>
                     )}
                   </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Descrição</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => onUpdateForm('description', e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-200 focus:border-brand-500 outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              /* VIEW DETAILS */
              event && (
                <div className="space-y-6">
                  <div>
                    <div className="flex gap-2 items-center mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_STYLES[event.category].bg} ${CATEGORY_STYLES[event.category].color} border ${CATEGORY_STYLES[event.category].border}`}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                      {event.is_automatic && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700">Gerado pelo Sistema</span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        event.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        event.status === 'CANCELED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        event.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {event.status === 'PENDING' ? 'Pendente' :
                         event.status === 'CONFIRMED' ? 'Confirmado' :
                         event.status === 'COMPLETED' ? 'Realizado' :
                         event.status === 'CANCELED' ? 'Cancelado' : event.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                    <p className="text-sm text-zinc-400 font-medium capitalize">
                      {format(new Date(event.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      {event.time && ` às ${event.time}`}
                      {event.end_time && ` — ${event.end_time}`}
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
                    {event.animal_name && (
                      <div className="flex gap-3 items-center">
                        <Dog size={16} className="text-zinc-500" />
                        <span className="text-sm font-semibold text-zinc-300">Animal:</span>
                        <span className="text-sm text-brand-400 font-bold">{event.animal_name}</span>
                      </div>
                    )}
                    
                    {event.client_name && (
                       <div className="flex gap-3 items-center">
                         <User size={16} className="text-zinc-500" />
                         <span className="text-sm font-semibold text-zinc-300">Cliente:</span>
                         <span className="text-sm text-brand-400 font-bold">{event.client_name}</span>
                       </div>
                    )}
                    
                    {event.description && (
                      <div className="pt-2 border-t border-zinc-800/50 mt-2">
                        <p className="text-sm text-zinc-400 leading-relaxed">{event.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end gap-3 shrink-0 flex-wrap">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </button>
            
            {mode === 'create' ? (
              <button
                onClick={onSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {event ? 'Atualizar Evento' : 'Salvar Evento'}
              </button>
            ) : (
              <>
                <button
                  onClick={onSwitchToEdit}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => event && onDelete(event.id)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} /> Excluir
                </button>
                {event?.status !== 'COMPLETED' && event?.status !== 'CANCELED' && (
                  <button
                    onClick={() => event && onStatusUpdate(event.id, 'COMPLETED')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={16} /> Marcar como Realizado
                  </button>
                )}
                {event?.status !== 'CANCELED' && (
                  <button
                    onClick={() => event && onStatusUpdate(event.id, 'CANCELED')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-zinc-600 text-white hover:bg-zinc-500 transition-colors"
                  >
                    Cancelar Evento
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
