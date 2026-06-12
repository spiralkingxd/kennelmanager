import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Mail, Phone, Instagram, MapPin, X, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../../shared/utils/apiFetch';

const TYPE_ICON: Record<string, React.ReactNode> = {
  WHATSAPP: <MessageSquare size={16} />,
  PHONE: <Phone size={16} />,
  EMAIL: <Mail size={16} />,
  VISIT: <MapPin size={16} />,
  SOCIAL_MEDIA: <Instagram size={16} />,
  OTHER: <MessageSquare size={16} />,
};

const TYPE_LABEL: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  PHONE: 'Telefone',
  EMAIL: 'E-mail',
  VISIT: 'Visita',
  SOCIAL_MEDIA: 'Rede Social',
  OTHER: 'Outro',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export function ClienteInteracoesTab({ clienteId }: { clienteId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('OTHER');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch(`/client-interactions/client/${clienteId}`);
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Erro ao carregar interações');
      }
    } catch {
      setError('Erro de conexão ao servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) return;
    setSubmitting(true);
    try {
      const json = await apiFetch('/client-interactions', {
        method: 'POST',
        body: JSON.stringify({ clientId: clienteId, type: formType, description: formDesc }),
      });
      if (json.success) {
        setShowForm(false);
        setFormType('OTHER');
        setFormDesc('');
        fetchData();
      } else {
        alert(json.message || 'Erro ao registrar interação');
      }
    } catch {
      alert('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-zinc-800 pb-6">
         <div>
           <h3 className="text-lg font-bold text-white">Histórico de Contatos</h3>
           <p className="text-sm text-zinc-500">Acompanhe toda a linha do tempo de relacionamento</p>
         </div>
         <button
           onClick={() => setShowForm(!showForm)}
           className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md hover:bg-brand-600 transition-all"
         >
           {showForm ? <X size={18} /> : <Plus size={18} />}
           {showForm ? 'Cancelar' : 'Registrar Interação'}
         </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5 space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Tipo</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {Object.entries(TYPE_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Descrição</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Descreva o contato realizado..."
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !formDesc.trim()}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Registrar
            </button>
          </div>
        </form>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-brand-500 rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <p className="text-zinc-400 text-sm">{error}</p>
          <button onClick={fetchData} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="relative pl-4 lg:pl-8 py-2">
           <div className="absolute bottom-0 left-6 lg:left-10 top-0 w-px bg-zinc-800"></div>

           <div className="flex flex-col gap-8 relative z-10">
              {data.length > 0 ? (
                 data.map((interaction: any) => (
                    <div key={interaction.id} className="relative flex gap-6">
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-sm relative -left-[18px]">
                          {TYPE_ICON[interaction.type] || <MessageSquare size={16} />}
                       </div>
                       <div className="flex-1 flex flex-col sm:flex-row gap-4 justify-between items-start bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                          <div className="flex flex-col min-w-0 flex-1">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-white">{TYPE_LABEL[interaction.type] || interaction.type}</span>
                                {interaction.user_name && (
                                  <>
                                    <span className="text-zinc-700 px-2">•</span>
                                    <span className="text-xs font-medium text-zinc-400">Por: {interaction.user_name}</span>
                                  </>
                                )}
                             </div>
                             <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                                {interaction.description}
                             </p>
                          </div>
                          <div className="shrink-0 pt-0.5">
                             <span className="text-xs font-semibold text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-800">
                               {formatDate(interaction.date)}
                             </span>
                          </div>
                       </div>
                    </div>
                 ))
              ) : (
                 <div className="py-12 text-center text-zinc-500">
                    Nenhuma interação registrada.
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
