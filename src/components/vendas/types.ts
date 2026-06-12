export interface Puppy {
  id: string;
  name?: string;
  mother_name?: string;
  father_name?: string;
  color?: string;
  client_name?: string;
  status: string;
  litter_id?: string;
  sex?: string;
  weight?: number;
  price?: number;
  breed?: string;
  microchip?: string;
  registration_number?: string;
  sale_date?: string;
  sale_notes?: string;
}

export interface MonthlyData {
  name: string;
  receita: number;
  despesa: number;
}

export interface AnimalProfit {
  id: string;
  name: string;
  breed: string;
  revenue: number;
  costs: number;
  profit: number;
  totalTransactions: number;
}

export interface AnimalCost {
  id: string;
  name: string;
  breed: string | null;
  totalCost: number;
  totalIncome: number;
  transactions: number;
}

export interface MatchData {
  id: string;
  puppy_name: string;
  sex: string;
  color: string;
  price: number;
  litter_name: string;
  mother_name: string;
  breed: string;
}

export interface WaitlistEntry {
  id: string;
  client_id: string;
  client_name: string;
  client_phone?: string;
  preferred_breed?: string;
  preferred_gender?: string;
  preferred_color?: string;
  max_price?: number | null;
  notes?: string;
  status: string;
  created_at: string;
}

export interface ClientOption {
  id: string;
  name: string;
  phone?: string;
}

export interface PuppyOption {
  id: string;
  name: string;
  color?: string;
  litterName?: string;
}

export interface VendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  venda?: Record<string, any> | null;
}
