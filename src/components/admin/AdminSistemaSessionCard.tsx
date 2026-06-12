import { Clock, Save, Loader2 } from 'lucide-react';
import type { SessionForm } from './AdminSistemaConstants';

interface AdminSistemaSessionCardProps {
  form: SessionForm;
  onChange: (updates: Partial<SessionForm>) => void;
  saving: boolean;
  onSave: () => void;
}

export function AdminSistemaSessionCard({ form, onChange, saving, onSave }: AdminSistemaSessionCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
       <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-zinc-400" /> Sessão & Segurança</h3>
       <p className="text-xs text-zinc-500 mb-6">Controle de acesso e timeouts da plataforma.</p>

       <div className="space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
             <div>
               <p className="text-sm font-bold text-zinc-200">Timeout de Inatividade</p>
               <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Desconectar após minutos sem interação</p>
             </div>
             <div className="w-24 shrink-0">
               <select
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none"
                 value={form.timeout_minutes}
                 onChange={e => onChange({ timeout_minutes: Number(e.target.value) })}
               >
                 <option value={15}>15 min</option>
                 <option value={30}>30 min</option>
                 <option value={60}>1 hora</option>
               </select>
             </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4">
             <div>
               <p className="text-sm font-bold text-zinc-200">Máx. Tentativas de Login</p>
               <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Bloqueio temporário (15m) após erros</p>
             </div>
             <div className="w-24 shrink-0">
               <select
                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none"
                 value={form.max_login_attempts}
                 onChange={e => onChange({ max_login_attempts: Number(e.target.value) })}
               >
                 <option value={3}>3 erros</option>
                 <option value={5}>5 erros</option>
                 <option value={10}>10 erros</option>
               </select>
             </div>
          </div>
       </div>

       <div className="flex justify-end mt-6">
         <button
           onClick={onSave}
           disabled={saving}
           className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
         >
           {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
           Salvar
         </button>
       </div>
    </div>
  );
}
