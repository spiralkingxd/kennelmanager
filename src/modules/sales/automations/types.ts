import type { Logger } from 'winston';

export type SaleStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface SaleLike {
  id: string;
  client_id: string;
  puppy_id: string | null;
  status: SaleStatus;
  condition?: string | null;
  entry_value?: string | number | null;
  total_value?: string | number | null;
  completed_at?: string | null;
  created_by?: string;
  notes?: string | null;
}

export interface PuppyLike {
  id: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | string;
  client_id?: string | null;
}
