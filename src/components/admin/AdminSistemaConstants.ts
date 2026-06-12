export interface IdentityForm {
  name: string;
  cnpj: string;
  address: string;
  email: string;
  phone: string;
}

export interface SmtpForm {
  host: string;
  port: number;
  user: string;
  pass: string;
  from_name: string;
  from_email: string;
}

export interface SessionForm {
  timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
}

export type SystemConfigMap = Record<string, any>;
