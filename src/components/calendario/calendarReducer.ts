// src/components/calendario/calendarReducer.ts
import { addMonths, subMonths, format } from 'date-fns';
import type { CalendarEvent, FormState } from './types';
import { EMPTY_FORM, ALL_CATEGORIES } from './constants';

export type ViewMode = 'month' | 'week' | 'list';

export type CalendarState = {
  // Navigation
  currentDate: Date;
  viewMode: ViewMode;
  // Filters
  activeFilters: Record<string, boolean>;
  // Events
  events: CalendarEvent[];
  loading: boolean;
  // Modal
  isEventModalOpen: boolean;
  modalMode: 'create' | 'view';
  selectedEvent: CalendarEvent | null;
  form: FormState;
  saving: boolean;
  // Search
  animalResults: { id: string; name: string }[];
  clientResults: { id: string; name: string }[];
  searchLoading: 'animal' | 'client' | null;
  showAnimalDropdown: boolean;
  showClientDropdown: boolean;
};

export type CalendarAction =
  // Navigation
  | { type: 'SET_DATE'; date: Date }
  | { type: 'SET_VIEW'; view: ViewMode }
  | { type: 'PREV_MONTH' }
  | { type: 'NEXT_MONTH' }
  | { type: 'GO_TO_TODAY' }
  // Filters
  | { type: 'TOGGLE_FILTER'; category: string }
  | { type: 'SET_ALL_FILTERS'; value: boolean }
  // Events
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; events: CalendarEvent[] }
  | { type: 'LOAD_ERROR' }
  // Modal
  | { type: 'OPEN_CREATE_MODAL'; date?: string }
  | { type: 'OPEN_VIEW_MODAL'; event: CalendarEvent }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SWITCH_TO_EDIT' }
  | { type: 'SET_FORM_FIELD'; field: keyof FormState; value: any }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_END' }
  // Search
  | { type: 'SEARCH_RESULTS'; entity: 'animal' | 'client'; results: { id: string; name: string }[] }
  | { type: 'SEARCH_LOADING'; entity: 'animal' | 'client' | null }
  | { type: 'SEARCH_DROPDOWN'; entity: 'animal' | 'client'; open: boolean }
  | { type: 'SEARCH_CLEAR'; entity: 'animal' | 'client' };

export const initialCalendarState: CalendarState = {
  currentDate: new Date(),
  viewMode: 'month',
  activeFilters: Object.fromEntries(ALL_CATEGORIES.map((c) => [c, true])),
  events: [],
  loading: false,
  isEventModalOpen: false,
  modalMode: 'create',
  selectedEvent: null,
  form: EMPTY_FORM,
  saving: false,
  animalResults: [],
  clientResults: [],
  searchLoading: null,
  showAnimalDropdown: false,
  showClientDropdown: false,
};

export function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    // Navigation
    case 'SET_DATE':
      return { ...state, currentDate: action.date };
    case 'SET_VIEW':
      return { ...state, viewMode: action.view };
    case 'PREV_MONTH':
      return { ...state, currentDate: subMonths(state.currentDate, 1) };
    case 'NEXT_MONTH':
      return { ...state, currentDate: addMonths(state.currentDate, 1) };
    case 'GO_TO_TODAY':
      return { ...state, currentDate: new Date() };

    // Filters
    case 'TOGGLE_FILTER':
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          [action.category]: !state.activeFilters[action.category],
        },
      };
    case 'SET_ALL_FILTERS':
      return {
        ...state,
        activeFilters: Object.fromEntries(ALL_CATEGORIES.map((c) => [c, action.value])),
      };

    // Events
    case 'LOAD_START':
      return { ...state, loading: true };
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, events: action.events };
    case 'LOAD_ERROR':
      return { ...state, loading: false };

    // Modal
    case 'OPEN_CREATE_MODAL':
      return {
        ...state,
        selectedEvent: null,
        modalMode: 'create',
        form: {
          ...EMPTY_FORM,
          date: action.date ?? format(new Date(), 'yyyy-MM-dd'),
        },
        isEventModalOpen: true,
      };
    case 'OPEN_VIEW_MODAL': {
      const e = action.event;
      return {
        ...state,
        selectedEvent: e,
        modalMode: 'view',
        form: {
          title: e.title,
          date: e.date || '',
          time: e.time || '',
          endTime: e.end_time || '',
          category: e.category,
          description: e.description || '',
          color: e.color || '',
          status: e.status,
          animalId: e.animal_id || '',
          animalName: e.animal_name || '',
          clientId: e.client_id || '',
          clientName: e.client_name || '',
        },
        isEventModalOpen: true,
      };
    }
    case 'CLOSE_MODAL':
      return { ...state, isEventModalOpen: false };
    case 'SWITCH_TO_EDIT':
      return { ...state, modalMode: 'create' };
    case 'SET_FORM_FIELD':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'SAVE_START':
      return { ...state, saving: true };
    case 'SAVE_END':
      return { ...state, saving: false };

    // Search
    case 'SEARCH_RESULTS':
      return action.entity === 'animal'
        ? { ...state, animalResults: action.results }
        : { ...state, clientResults: action.results };
    case 'SEARCH_LOADING':
      return { ...state, searchLoading: action.entity };
    case 'SEARCH_DROPDOWN':
      return action.entity === 'animal'
        ? { ...state, showAnimalDropdown: action.open }
        : { ...state, showClientDropdown: action.open };
    case 'SEARCH_CLEAR':
      return action.entity === 'animal'
        ? { ...state, animalResults: [], showAnimalDropdown: false }
        : { ...state, clientResults: [], showClientDropdown: false };

    default:
      return state;
  }
}
