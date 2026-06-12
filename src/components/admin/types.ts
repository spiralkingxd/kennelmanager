export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  last_login: string | null;
  isProtected?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FormState {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  password: string;
}
