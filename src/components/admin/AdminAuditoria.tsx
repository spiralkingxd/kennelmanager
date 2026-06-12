import React, { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { apiFetch } from '../../shared/utils/apiFetch';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';
import { ACTION_LABEL, ENTITY_LABEL, formatDate } from './auditConstants';

export function AdminAuditoria() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (searchTerm) params.set('entity_type', searchTerm);

      const today = new Date();
      if (periodFilter === 'today') {
        const ds = today.toISOString().slice(0, 10);
        params.set('start_date', ds);
        params.set('end_date', ds);
      } else if (periodFilter === '7d') {
        const d = new Date(today);
        d.setDate(d.getDate() - 7);
        params.set('start_date', d.toISOString().slice(0, 10));
      } else if (periodFilter === '30d') {
        const d = new Date(today);
        d.setDate(d.getDate() - 30);
        params.set('start_date', d.toISOString().slice(0, 10));
      }

      const json = await apiFetch(`/audit?${params}`);
      if (json.success) {
        setLogs(json.data || []);
        setTotal(json.meta?.total || 0);
        setTotalPages(Math.ceil((json.meta?.total || 0) / 20));
      } else {
        setError(json.message || 'Erro ao carregar');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, searchTerm, periodFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePeriodChange = (value: string) => {
    setPeriodFilter(value);
    setPage(1);
  };

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  const handleDownloadCSV = () => {
    if (!logs.length) return;

    const headers = ['Data/Hora', 'Usuário', 'Ação', 'Módulo', 'IP'];
    const rows = logs.map((l) => [
      formatDate(l.created_at),
      l.user_name || `ID ${l.user_id}`,
      ACTION_LABEL[l.action] || l.action,
      ENTITY_LABEL[l.entity_type] || l.entity_type,
      l.ip_address || '—',
    ]);

    const bom = '\uFEFF';
    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AuditFilters
        searchTerm={searchTerm}
        periodFilter={periodFilter}
        actionFilter={actionFilter}
        onSearchChange={handleSearchChange}
        onPeriodChange={handlePeriodChange}
        onActionChange={handleActionChange}
        onDownloadCSV={handleDownloadCSV}
      />

      <AuditTable
        logs={logs}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={(p) => setPage(p)}
        onRetry={fetchLogs}
      />

      <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
        <Shield className="text-red-500 mt-0.5 shrink-0" size={18} />
        <div>
          <p className="text-sm font-bold text-red-400">
            Nota de Segurança e Conformidade
          </p>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            O log de auditoria é <strong>imutável</strong> por design. Nem mesmo
            usuários com perfil de Administrador podem adulterar ou excluir
            registros deste módulo. Os logs são mantidos por 5 anos conforme
            política LGPD padrão.
          </p>
        </div>
      </div>
    </div>
  );
}
