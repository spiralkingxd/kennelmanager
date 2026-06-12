import { Mail, Save, Loader2 } from 'lucide-react';
import type { SmtpForm } from './AdminSistemaConstants';

interface AdminSistemaSmtpCardProps {
  form: SmtpForm;
  onChange: (updates: Partial<SmtpForm>) => void;
  saving: boolean;
  onSave: () => void;
}

export function AdminSistemaSmtpCard({ form, onChange, saving, onSave }: AdminSistemaSmtpCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
       <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Mail size={18} className="text-zinc-400" /> Configuração de E-mail</h3>
       <p className="text-xs text-zinc-500 mb-6">Utilizado para enviar notificações, recibos e recuperação de senha.</p>

       <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Servidor SMTP</label>
              <input
                type="text"
                value={form.host}
                onChange={e => onChange({ host: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Porta</label>
              <input
                type="number"
                value={form.port}
                onChange={e => onChange({ port: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Nome do Remetente</label>
            <input
              type="text"
              value={form.from_name}
              onChange={e => onChange({ from_name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">E-mail Remetente</label>
            <input
              type="email"
              value={form.from_email}
              onChange={e => onChange({ from_email: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Senha do Servidor / Token</label>
            <input
              type="password"
              value={form.pass}
              onChange={e => onChange({ pass: e.target.value })}
              placeholder="********"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-between items-center">
             <span className="text-xs font-semibold text-brand-500 hover:text-brand-400 underline underline-offset-4 cursor-pointer">Testar Conexão</span>
             <button
               onClick={onSave}
               disabled={saving}
               className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
             >
               {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
               Salvar E-mail
             </button>
          </div>
       </div>
    </div>
  );
}
