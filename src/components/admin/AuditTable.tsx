import { Loader2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ACTION_LABEL, ACTION_COLOR, ENTITY_LABEL, formatDate } from './auditConstants';

interface AuditTableProps {
  logs: any[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export function AuditTable({
  logs,
  loading,
  error,
  page,
  totalPages,
  total,
  onPageChange,
  onRetry,
}: AuditTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500 border-b border-zinc-800 font-semibold">
            <tr>
              <th className="px-6 py-4">Data/Hora</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Ação</th>
              <th className="px-6 py-4">Módulo</th>
              <th className="px-6 py-4">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Loader2
                    size={32}
                    className="mx-auto animate-spin text-zinc-600"
                  />
                  <p className="text-sm text-zinc-500 mt-3">
                    Carregando registros...
                  </p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <AlertCircle
                    size={32}
                    className="mx-auto text-red-500"
                  />
                  <p className="text-sm text-red-400 mt-3">{error}</p>
                  <button
                    onClick={onRetry}
                    className="mt-4 px-5 py-2 bg-zinc-800 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Search
                    size={32}
                    className="mx-auto text-zinc-600"
                  />
                  <p className="text-sm text-zinc-500 mt-3">
                    Nenhum registro de auditoria encontrado
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-zinc-300">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-3 font-semibold text-zinc-200 whitespace-nowrap">
                    {log.user_name || `ID ${log.user_id}`}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        ACTION_COLOR[log.action] || 'bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {ACTION_LABEL[log.action] || log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-300">
                    {ENTITY_LABEL[log.entity_type] || log.entity_type}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-zinc-500">
                    {log.ip_address || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-500">
          <span>
            Mostrando {logs.length} de {total} registros
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Próximo <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
