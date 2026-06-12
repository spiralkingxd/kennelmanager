import { Camera, Save, Loader2 } from 'lucide-react';
import type { IdentityForm } from './AdminSistemaConstants';

interface AdminSistemaIdentityCardProps {
  form: IdentityForm;
  onChange: (updates: Partial<IdentityForm>) => void;
  saving: boolean;
  onSave: () => void;
}

export function AdminSistemaIdentityCard({ form, onChange, saving, onSave }: AdminSistemaIdentityCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Identidade do Canil</h3>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3 w-40 shrink-0">
          <div className="w-32 h-32 rounded-xl bg-zinc-950 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 relative cursor-pointer hover:border-brand-500 hover:text-brand-500 transition-colors group">
             <Camera size={24} className="mb-2" />
             <span className="text-xs font-semibold">Alterar Logo</span>
          </div>
          <p className="text-[10px] text-zinc-500 text-center">Formato PNG ou JPG (Max 2MB, 512x512)</p>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Nome do Canil</label>
            <input
              type="text"
              value={form.name}
              onChange={e => onChange({ name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">CNPJ / CPF</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={e => onChange({ cnpj: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Endereço Completo</label>
            <input
              type="text"
              value={form.address}
              onChange={e => onChange({ address: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">E-mail Público</label>
            <input
              type="email"
              value={form.email}
              onChange={e => onChange({ email: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Telefone Público</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => onChange({ phone: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Identidade
        </button>
      </div>
    </div>
  );
}
