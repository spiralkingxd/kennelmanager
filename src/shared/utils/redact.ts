// src/shared/utils/redact.ts
// Recursively walks objects and replaces values of sensitive keys with '***REDACTED***'
// Used by the winston logger to prevent LGPD/GDPR-sensitive data (passwords, tokens,
// credentials, PII) from being written to log files.

export const SENSITIVE_KEYS =
  /password|senha|token|secret|authorization|apikey|api_key|cookie|jwt|credit_card|cardnumber|cvv|ssn|cpf|email|username|phone|telefone|celular|address|endereco|birth_date|data_nascimento|birthDate/i;

export function redact(meta: any): any {
  if (meta === null || meta === undefined) return meta;
  if (typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map(redact);
  const out: any = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.test(k)) {
      out[k] = '***REDACTED***';
    } else if (typeof v === 'object' && v !== null) {
      out[k] = redact(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
