import { useState, useEffect } from 'react';
import { Target, Heart, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../../shared/utils/apiFetch';

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const GENDER_LABEL: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};

export function ClientePreferenciasTab({ clienteId }: { clienteId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await apiFetch('/waitlist');
        if (!cancelled) {
          if (json.success) {
            setData(json.data.filter((item: any) => item.client_id === clienteId));
          } else {
            setError(json.message || 'Erro ao carregar preferências');
          }
        }
      } catch {
        if (!cancelled) setError('Erro de conexão ao servidor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [clienteId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="rounded-full bg-red-500/10 p-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/20">
        <span className="text-sm text-zinc-500">Nenhuma preferência registrada.</span>
      </div>
    );
  }

  const pref = data[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

       <div className="space-y-8">
          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <Target size={16} className="text-zinc-500" /> Perfil do Animal Desejado
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Raça</span>
                 <span className="text-sm font-medium text-zinc-200">{pref.preferred_breed || 'Não definida'}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Sexo</span>
                 <span className="text-sm font-medium text-zinc-200">
                   {pref.preferred_gender ? (GENDER_LABEL[pref.preferred_gender] || pref.preferred_gender) : 'Indiferente'}
                 </span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Cor / Pelagem</span>
                 <span className="text-sm font-medium text-zinc-200">{pref.preferred_color || 'Qualquer'}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Orçamento Máximo</span>
                 <span className="text-sm font-medium text-emerald-400">{formatCurrency(pref.max_price)}</span>
               </div>
             </div>
          </section>
       </div>

       <div className="space-y-8">
          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <Heart size={16} className="text-zinc-500" /> Anotações sobre Preferências
             </h3>
             <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-5 mt-2 min-h-[100px]">
               {pref.notes ? (
                 <p className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed">{pref.notes}</p>
               ) : (
                 <p className="text-sm text-zinc-500 italic">Sem anotações adicionais.</p>
               )}
             </div>
          </section>

          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <DollarSign size={16} className="text-zinc-500" /> Status da Lista de Espera
             </h3>
             <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-5">
               <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                 pref.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400' :
                 pref.status === 'MATCHED' ? 'bg-emerald-500/10 text-emerald-400' :
                 pref.status === 'COMPLETED' ? 'bg-zinc-500/10 text-zinc-400' :
                 pref.status === 'EXPIRED' ? 'bg-amber-500/10 text-amber-400' :
                 pref.status === 'CANCELED' ? 'bg-red-500/10 text-red-400' :
                 'bg-zinc-800 text-zinc-400'
               }`}>
                 {pref.status === 'ACTIVE' ? 'Ativo' :
                  pref.status === 'MATCHED' ? 'Match' :
                  pref.status === 'COMPLETED' ? 'Concluído' :
                  pref.status === 'EXPIRED' ? 'Expirado' :
                  pref.status === 'CANCELED' ? 'Cancelado' :
                  pref.status || '—'}
               </span>
             </div>
          </section>
       </div>

    </div>
  );
}
