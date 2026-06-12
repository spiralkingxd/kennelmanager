import { useState, useEffect } from 'react';
import { Dog, DollarSign, DogIcon, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../../shared/utils/apiFetch';

const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  RETAINED: 'Retido',
};

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400',
  RESERVED: 'bg-amber-500/10 text-amber-500',
  SOLD: 'bg-zinc-800 text-zinc-400',
  RETAINED: 'bg-purple-500/10 text-purple-400',
};

const SEX_LABEL: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
};

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function ClienteFilhotesTab({ clienteId }: { clienteId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await apiFetch('/puppies');
        if (!cancelled) {
          if (json.success) {
            setData(json.data.filter((item: any) => item.client_id === clienteId));
          } else {
            setError(json.message || 'Erro ao carregar filhotes');
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
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20">
        <Dog size={32} className="text-zinc-700 mb-3" />
        <p className="text-sm text-zinc-500">Este cliente ainda não adquiriu filhotes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="mb-6 border-b border-zinc-800 pb-4">
         <h3 className="text-lg font-bold text-white">Filhotes Adquiridos</h3>
         <p className="text-sm text-zinc-500">{data.length} filhote{data.length !== 1 ? 's' : ''} vinculado{data.length !== 1 ? 's' : ''} a este cliente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((puppy: any) => (
          <div key={puppy.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/40">

             <div className="flex items-center gap-4 mb-4 border-b border-zinc-800/50 pb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DogIcon size={24} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-bold text-white truncate">{puppy.name || puppy.color || 'Sem nome'}</span>
                  {puppy.litter_name && (
                    <span className="text-xs font-medium text-zinc-500 truncate">{puppy.litter_name}</span>
                  )}
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col bg-zinc-800/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Sexo</span>
                    <span className="text-sm font-medium text-zinc-200">{SEX_LABEL[puppy.sex] || puppy.sex || '—'}</span>
                  </div>
                  <div className="flex flex-col bg-zinc-800/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Cor</span>
                    <span className="text-sm font-medium text-zinc-200 truncate">{puppy.color || '—'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="text-zinc-500 flex items-center gap-1.5"><DollarSign size={14}/> Valor</span>
                  <span className="text-zinc-200 font-medium">{formatCurrency(puppy.price)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Status</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[puppy.status] || 'bg-zinc-800 text-zinc-400'}`}>
                    {STATUS_LABEL[puppy.status] || puppy.status || '—'}
                  </span>
                </div>
             </div>

          </div>
        ))}
      </div>

    </div>
  );
}
