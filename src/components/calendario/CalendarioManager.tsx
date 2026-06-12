import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent, FormState } from './types';
import { calendarReducer, initialCalendarState, type ViewMode } from './calendarReducer';
import { NotificationToast } from './NotificationToast';
import { apiFetch } from '../../shared/utils/apiFetch';
import { EventModal } from './EventModal';
import { CalendarHeader } from './CalendarHeader';
import { CalendarFilters } from './CalendarFilters';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { ListView } from './ListView';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function CalendarioManager() {
  const [state, dispatch] = useReducer(calendarReducer, initialCalendarState);
  // notification stays as useState: it owns a setTimeout side-effect
  // that does not belong in the reducer.
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // --- API calls ---
  const fetchEvents = useCallback(async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const json = await apiFetch('/calendar');
      if (json.success) dispatch({ type: 'LOAD_SUCCESS', events: json.data });
    } catch (err) {
      console.error('Failed to fetch events', err);
      dispatch({ type: 'LOAD_ERROR' });
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async () => {
    const { form, modalMode, selectedEvent } = state;
    if (!form.title?.trim()) { showNotification('error', 'Título é obrigatório'); return; }
    if (!form.date) { showNotification('error', 'Data é obrigatória'); return; }

    dispatch({ type: 'SAVE_START' });
    try {
      const body: Record<string, any> = {
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        ...(form.time && { time: form.time }),
        ...(form.endTime && { endTime: form.endTime }),
        ...(form.description.trim() && { description: form.description.trim() }),
        ...(form.color && { color: form.color }),
        ...(form.animalId && { animalId: form.animalId }),
        ...(form.clientId && { clientId: form.clientId }),
      };

      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const url = method === 'PUT' ? `/calendar/${selectedEvent!.id}` : '/calendar';

      const json = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      if (json.success) {
        showNotification('success', modalMode === 'create' ? 'Evento criado com sucesso!' : 'Evento atualizado com sucesso!');
        dispatch({ type: 'CLOSE_MODAL' });
        await fetchEvents();
      } else {
        showNotification('error', json.message || 'Erro ao salvar evento');
      }
    } catch (err) {
      showNotification('error', 'Erro de conexão ao salvar evento');
    } finally {
      dispatch({ type: 'SAVE_END' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      const json = await apiFetch(`/calendar/${id}`, { method: 'DELETE' });
      if (json.success) {
        showNotification('success', 'Evento excluído!');
        dispatch({ type: 'CLOSE_MODAL' });
        await fetchEvents();
      } else {
        showNotification('error', json.message || 'Erro ao excluir');
      }
    } catch (err) {
      showNotification('error', 'Erro de conexão ao excluir');
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const json = await apiFetch(`/calendar/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (json.success) {
        showNotification('success', `Status atualizado para ${newStatus}`);
        dispatch({ type: 'CLOSE_MODAL' });
        await fetchEvents();
      }
    } catch (err) {
      showNotification('error', 'Erro ao atualizar status');
    }
  };

  // --- Form helpers ---
  const updateForm = (field: keyof FormState, value: any) => {
    dispatch({ type: 'SET_FORM_FIELD', field, value });
  };

  const openCreateModal = (date?: Date) => {
    dispatch({
      type: 'OPEN_CREATE_MODAL',
      date: date ? format(date, 'yyyy-MM-dd') : undefined,
    });
  };

  const openViewModal = (event: CalendarEvent) => {
    dispatch({ type: 'OPEN_VIEW_MODAL', event });
  };

  const switchToEdit = () => {
    dispatch({ type: 'SWITCH_TO_EDIT' });
  };

  const setViewMode = (view: ViewMode) => {
    dispatch({ type: 'SET_VIEW', view });
  };

  const nextMonth = () => dispatch({ type: 'NEXT_MONTH' });
  const prevMonth = () => dispatch({ type: 'PREV_MONTH' });
  const goToToday = () => dispatch({ type: 'GO_TO_TODAY' });

  const toggleFilter = (cat: string) => {
    dispatch({ type: 'TOGGLE_FILTER', category: cat });
  };
  const setAllFilters = (val: boolean) => {
    dispatch({ type: 'SET_ALL_FILTERS', value: val });
  };

  // --- Search autocomplete ---
  const searchItems = async (type: 'animal' | 'client', query: string) => {
    if (!query.trim()) {
      dispatch({ type: 'SEARCH_CLEAR', entity: type });
      return;
    }
    dispatch({ type: 'SEARCH_LOADING', entity: type });
    try {
      const endpoint = type === 'animal' ? '/animals' : '/clients';
      const json = await apiFetch(`${endpoint}?take=20`);
      if (json.success) {
        const results = (json.data || [])
          .filter((item: any) => item.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
          .map((item: any) => ({ id: item.id, name: item.name }));
        dispatch({ type: 'SEARCH_RESULTS', entity: type, results });
        dispatch({ type: 'SEARCH_DROPDOWN', entity: type, open: results.length > 0 });
      }
    } catch { /* ignore errors */ }
    finally { dispatch({ type: 'SEARCH_LOADING', entity: null }); }
  };

  const handleSearchChange = (type: 'animal' | 'client', value: string) => {
    if (type === 'animal') {
      dispatch({ type: 'SET_FORM_FIELD', field: 'animalName', value });
      dispatch({ type: 'SET_FORM_FIELD', field: 'animalId', value: '' });
    } else {
      dispatch({ type: 'SET_FORM_FIELD', field: 'clientName', value });
      dispatch({ type: 'SET_FORM_FIELD', field: 'clientId', value: '' });
    }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchItems(type, value), 300);
  };

  const selectItem = (type: 'animal' | 'client', id: string, name: string) => {
    if (type === 'animal') {
      dispatch({ type: 'SET_FORM_FIELD', field: 'animalId', value: id });
      dispatch({ type: 'SET_FORM_FIELD', field: 'animalName', value: name });
      dispatch({ type: 'SEARCH_DROPDOWN', entity: 'animal', open: false });
    } else {
      dispatch({ type: 'SET_FORM_FIELD', field: 'clientId', value: id });
      dispatch({ type: 'SET_FORM_FIELD', field: 'clientName', value: name });
      dispatch({ type: 'SEARCH_DROPDOWN', entity: 'client', open: false });
    }
  };

  // ─── Render principal ──────────────────────────────────────────────────────
  return (
    <div>
      <NotificationToast notification={notification} />

      <CalendarHeader
        currentDate={state.currentDate}
        viewMode={state.viewMode}
        onViewModeChange={setViewMode}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onGoToToday={goToToday}
        onNewEvent={() => openCreateModal(new Date())}
      />

      <CalendarFilters
        activeFilters={state.activeFilters}
        onToggleFilter={toggleFilter}
        onSetAllFilters={setAllFilters}
      />

      {state.viewMode === 'month' && (
        <MonthView
          currentDate={state.currentDate}
          events={state.events}
          activeFilters={state.activeFilters}
          onOpenCreateModal={openCreateModal}
          onOpenViewModal={openViewModal}
        />
      )}

      {state.viewMode === 'week' && (
        <WeekView
          currentDate={state.currentDate}
          events={state.events}
          activeFilters={state.activeFilters}
          onOpenCreateModal={openCreateModal}
          onOpenViewModal={openViewModal}
        />
      )}

      {state.viewMode === 'list' && (
        <ListView
          events={state.events}
          activeFilters={state.activeFilters}
          onOpenViewModal={openViewModal}
        />
      )}

      <EventModal
        isOpen={state.isEventModalOpen}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        mode={state.modalMode}
        event={state.selectedEvent}
        form={state.form}
        onUpdateForm={updateForm}
        onSave={handleSave}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
        onSwitchToEdit={switchToEdit}
        saving={state.saving}
        animalResults={state.animalResults}
        clientResults={state.clientResults}
        showAnimalDropdown={state.showAnimalDropdown}
        showClientDropdown={state.showClientDropdown}
        onShowAnimalDropdown={(open) => dispatch({ type: 'SEARCH_DROPDOWN', entity: 'animal', open })}
        onShowClientDropdown={(open) => dispatch({ type: 'SEARCH_DROPDOWN', entity: 'client', open })}
        searchLoading={state.searchLoading}
        onSearchChange={handleSearchChange}
        onSelectItem={selectItem}
      />
    </div>
  );
}
