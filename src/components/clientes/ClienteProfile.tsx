import { ChevronLeft, UserCircle, Heart, MessageSquare, DollarSign, Dog, Mail, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ClienteDadosTab } from './tabs/ClienteDadosTab';
import { ClientePreferenciasTab } from './tabs/ClientePreferenciasTab';
import { ClienteInteracoesTab } from './tabs/ClienteInteracoesTab';
import { ClienteFinanceiroTab } from './tabs/ClienteFinanceiroTab';
import { ClienteFilhotesTab } from './tabs/ClienteFilhotesTab';
import { ClienteModal } from './ClienteModal';
import { apiFetch } from '../../shared/utils/apiFetch';

interface ClienteProfileProps {
  clienteId: string;
  onBack: () => void;
  onDelete?: (name: string) => void;
}

export function ClienteProfile({ clienteId, onBack, onDelete }: ClienteProfileProps) {
  const [activeTab, setActiveTab] = useState('dados');
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch(`/clients/${clienteId}`)
      .then(res => {
        if (res.success) {
          setCliente(res.data);
        } else {
          setError(res.message || 'Erro ao carregar cliente');
        }
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false));
  }, [clienteId, refreshKey]);

  const handleSaved = (data: any) => {
    if (data) setCliente(data);
    setRefreshKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 p-8 text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        Carregando...
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-zinc-500">
        <p>{error || 'Cliente não encontrado'}</p>
        <button onClick={onBack} className="text-sm text-brand-500 hover:text-brand-400 transition-colors">
          Voltar
        </button>
      </div>
    );
  }

  const openWhatsApp = () => {
    const digits = (cliente.phone || '').replace(/\D/g, '');
    if (digits) window.open(`https://wa.me/55${digits}`, '_blank');
  };

  const tabs = [
    { id: 'dados', label: 'Dados Pessoais', icon: UserCircle },
    { id: 'preferencias', label: 'Preferências', icon: Heart },
    { id: 'interacoes', label: 'Histórico', icon: MessageSquare },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'filhotes', label: 'Filhotes Adquiridos', icon: Dog },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex flex-1 flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-3xl font-bold text-zinc-400 shadow-inner">
              {cliente.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">{cliente.name}</h1>
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-400">
                <Mail size={14} /> {cliente.email} <span className="text-zinc-700">•</span>
                <Phone size={14} /> {cliente.phone}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openWhatsApp}
              className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors"
            >
              <MessageSquare size={16} />
              WhatsApp
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Editar Cliente
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete?.(cliente.name)}
                className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-zinc-800 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-500 bg-zinc-800/30'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px] p-6 md:p-8">
          {activeTab === 'dados' && <ClienteDadosTab cliente={cliente} />}
          {activeTab === 'preferencias' && <ClientePreferenciasTab clienteId={clienteId} />}
          {activeTab === 'interacoes' && <ClienteInteracoesTab clienteId={clienteId} />}
          {activeTab === 'financeiro' && <ClienteFinanceiroTab clienteId={clienteId} />}
          {activeTab === 'filhotes' && <ClienteFilhotesTab clienteId={clienteId} />}
        </div>
      </div>

      <ClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        cliente={cliente}
      />
    </div>
  );
}
