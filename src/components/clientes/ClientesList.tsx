import { Search, Plus, Filter, Users, MapPin, Phone, Mail, Calendar, ChevronRight, Loader2, RefreshCw, Trash2, Pencil } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ClienteModal } from './ClienteModal';
import { apiFetch } from '../../shared/utils/apiFetch';

interface ClientesListProps {
  onSelectCliente: (id: string) => void;
  onDeleteCliente: (id: string, name: string) => void;
  refreshKey?: number;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function ClientesList({ onSelectCliente, onDeleteCliente, refreshKey, selectedIds, onToggleSelect }: ClientesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCliente, setEditCliente] = useState<any>(null);

  const openEditModal = (e: any, cliente: any) => {
    e.stopPropagation();
    setEditCliente(cliente);
    setIsModalOpen(true);
  };

  const fetchClientes = () => {
    setLoading(true);
    setError(null);
    apiFetch('/clients')
      .then((res) => {
        if (res.success) {
          setClientes(res.data);
        } else {
          setError(res.message || 'Erro ao carregar clientes');
        }
      })
      .catch(() => setError('Erro de conexão ao servidor'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClientes();
  }, [refreshKey]);

  // Sincroniza o termo de busca com o query param ?search= da URL
  // (acionado quando o Header navega para /clientes?search=...)
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchTerm(params.get('search') || '');
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) return clientes;
    const term = searchTerm.toLowerCase();
    return clientes.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
    );
  }, [clientes, searchTerm]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const allVisibleSelected = filteredClientes.length > 0 && filteredClientes.every(c => selectedIds.has(c.id));
  const someVisibleSelected = filteredClientes.some(c => selectedIds.has(c.id));

  return (
    <div className="space-y-6">
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditCliente(null); }}
        onSaved={() => {
          setIsModalOpen(false);
          setEditCliente(null);
          fetchClientes();
        }}
        cliente={editCliente}
      />

      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative flex-1 group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              aria-label="Buscar clientes"
              placeholder="Buscar por nome, telefone ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-sm text-zinc-500">
              {filteredClientes.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all"
          >
            <Plus size={18} />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 size={32} className="animate-spin mb-3 text-brand-500" />
          <span className="text-sm">Carregando clientes...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <div className="rounded-full bg-red-500/10 p-4 mb-4">
            <Users size={32} className="text-red-400" />
          </div>
          <p className="text-zinc-400 mb-1 font-medium">Erro ao carregar clientes</p>
          <p className="text-sm text-zinc-600 mb-4">{error}</p>
          <button
            onClick={fetchClientes}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw size={16} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClientes.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-220px)] py-20 text-zinc-500">
          <div className="rounded-full bg-zinc-800 p-4 mb-4">
            <Users size={32} />
          </div>
          <p className="text-zinc-400 font-medium mb-1">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </p>
          <p className="text-sm text-zinc-600">
            {searchTerm
              ? 'Tente ajustar sua busca'
              : 'Clique em "Novo Cliente" para cadastrar o primeiro'}
          </p>
        </div>
      )}

      {/* Tabela de Clientes */}
      {!loading && !error && filteredClientes.length > 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-800/50 text-xs font-semibold uppercase text-zinc-300">
                <tr>
                  <th scope="col" className="px-4 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      ref={(el) => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                      onChange={() => {
                        if (allVisibleSelected) {
                          filteredClientes.forEach(c => { if (selectedIds.has(c.id)) onToggleSelect(c.id); });
                        } else {
                          filteredClientes.forEach(c => { if (!selectedIds.has(c.id)) onToggleSelect(c.id); });
                        }
                      }}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th scope="col" className="px-6 py-4">Cliente</th>
                  <th scope="col" className="px-6 py-4">Contato</th>
                  <th scope="col" className="px-6 py-4">Endereço</th>
                  <th scope="col" className="px-6 py-4">Cadastro</th>
                  <th scope="col" className="px-6 py-4 text-right w-32">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                    onClick={() => onSelectCliente(cliente.id)}
                  >
                    <td className="px-4 py-4 w-12" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(cliente.id)}
                        onChange={() => onToggleSelect(cliente.id)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-sm font-bold text-zinc-400">
                          {cliente.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="font-semibold text-zinc-200">{cliente.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <Phone size={14} className="text-zinc-500" /> {cliente.phone || '-'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Mail size={12} /> {cliente.email || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-zinc-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{cliente.address || 'Não informado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-zinc-500" />
                        {formatDate(cliente.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => openEditModal(e, cliente)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-brand-500/10 hover:text-brand-400 transition-colors"
                          title="Editar cliente"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteCliente(cliente.id, cliente.name); }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Excluir cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-700 hover:text-white transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
