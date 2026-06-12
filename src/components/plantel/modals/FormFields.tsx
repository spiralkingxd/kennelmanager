import { useId } from 'react';
import { DateInput } from '../../../shared/components/DateInput';

interface FormFieldProps {
  label: string;
  value: any;
  onChange: (e: any) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function FormField({ label, value, onChange, type = 'text', required, placeholder, step, disabled, min, max }: FormFieldProps) {
  const id = useId();

  if (type === 'date') {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <DateInput value={value} onChange={onChange} id={id} disabled={disabled} required={required} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: any;
  onChange: (e: any) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

export function SelectField({ label, value, onChange, options, required }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: any;
  onChange: (e: any) => void;
  rows?: number;
  required?: boolean;
}

export function TextAreaField({ label, value, onChange, rows = 3, required }: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
      />
    </div>
  );
}

