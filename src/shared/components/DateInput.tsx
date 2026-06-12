import React, { useState, useEffect, useRef } from 'react';
import { formatDateBR } from '../utils/dateUtils';

interface DateInputProps {
  value?: string;      // YYYY-MM-DD (ISO)
  onChange: (e: { target: { value: string } }) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

/**
 * Input de data no padrão brasileiro DD/MM/YYYY.
 *
 * Aceita `value` em ISO (YYYY-MM-DD) e retorna ISO via onChange.
 * Exibe e permite digitação apenas no formato DD/MM/YYYY.
 * Auto-formata com barras conforme o usuário digita.
 * Só emite onChange quando 8 dígitos (data completa) ou campo vazio.
 */
export function DateInput({ value, onChange, id, disabled, required, placeholder = 'dd/mm/aaaa' }: DateInputProps) {
  const [display, setDisplay] = useState(() => formatDateBR(value || ''));
  const lastSync = useRef(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 8);

    // Formatar com barras
    let formatted = '';
    if (digits.length > 0) formatted = digits.slice(0, 2);
    if (digits.length > 2) formatted += '/' + digits.slice(2, 4);
    if (digits.length > 4) formatted += '/' + digits.slice(4, 8);
    setDisplay(formatted);

    // Só emite para o pai quando data completa ou vazio
    if (digits.length === 8) {
      const iso = `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
      lastSync.current = iso;
      onChange({ target: { value: iso } });
    } else if (digits.length === 0) {
      lastSync.current = undefined;
      onChange({ target: { value: '' } });
    }
    // 1-7 dígitos: não emite (pai mantém valor anterior)
  };

  // Sincronizar quando o valor externo mudar (ex: reset do formulário)
  useEffect(() => {
    if (value !== lastSync.current) {
      setDisplay(formatDateBR(value || ''));
      lastSync.current = value;
    }
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={10}
      disabled={disabled}
      required={required}
      id={id}
      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
    />
  );
}
