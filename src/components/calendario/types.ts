// ─── Types ───────────────────────────────────────────────────────────────────

export type EventCategory = 'HEALTH' | 'REPRODUCTION' | 'LITTER' | 'FINANCIAL' | 'VISIT' | 'EXHIBITION' | 'MANUAL';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string | null;
  end_time: string | null;
  category: EventCategory;
  description: string | null;
  is_automatic: boolean;
  color: string | null;
  status: string;
  animal_id: string | null;
  client_id: string | null;
  user_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  animal_name: string | null;
  client_name: string | null;
}

export interface FormState {
  title: string;
  date: string;
  time: string;
  endTime: string;
  category: EventCategory;
  description: string;
  color: string;
  status: string;
  animalId: string;
  animalName: string;
  clientId: string;
  clientName: string;
}
