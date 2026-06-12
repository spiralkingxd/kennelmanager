// src/components/notifications/NotificationPanel.tsx
// Painel de notificações (real). Consome GET /api/v1/notifications com polling
// de 30s, marca individual/collective como lida, mostra badge de não lidas e
// trata estados de loading/erro.
import { BellRing, HeartPulse, DollarSign, Baby, ChevronRight, Check, AlertTriangle, UserCheck, Wrench } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiFetch } from '../../shared/utils/apiFetch';

export type NotificationType =
  | 'HEALTH_ALERT'
  | 'REPRODUCTION_ALERT'
  | 'FINANCIAL_ALERT'
  | 'SALES_ALERT'
  | 'WAITLIST_MATCH'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface ApiListResponse {
  success: boolean;
  data: Array<{
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    description: string | null;
    reference_type: string | null;
    reference_id: string | null;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
  }>;
  meta?: { total: number };
}

// Mapeia row do backend (snake_case) → tipo do frontend (camelCase).
function mapRow(row: ApiListResponse['data'][number]): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

const POLL_INTERVAL_MS = 30_000;

export function NotificationPanel({
  isOpen,
  onClose,
  onUnreadCountChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const json = await apiFetch<ApiListResponse>('/notifications?limit=20');
      if (json.success) {
        setNotifications(json.data.map(mapRow));
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount + polling de 30s, independente do painel estar aberto,
  // para manter o badge de não-lidas atualizado no Header.
  useEffect(() => {
    setLoading(true);
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic: marca como lida localmente primeiro
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)),
    );
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err: any) {
      // Reverte em caso de erro
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false, readAt: null } : n)),
      );
      setError(err?.message || 'Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    const before = notifications;
    setNotifications((prev) =>
      prev.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() })),
    );
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
    } catch (err: any) {
      setNotifications(before);
      setError(err?.message || 'Erro ao marcar todas como lidas');
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'HEALTH_ALERT': return <HeartPulse size={16} className="text-emerald-500" />;
      case 'FINANCIAL_ALERT': return <DollarSign size={16} className="text-red-500" />;
      case 'SALES_ALERT': return <UserCheck size={16} className="text-brand-500" />;
      case 'REPRODUCTION_ALERT': return <Baby size={16} className="text-purple-500" />;
      case 'WAITLIST_MATCH': return <Wrench size={16} className="text-amber-500" />;
      case 'SYSTEM':
      default: return <BellRing size={16} className="text-zinc-500" />;
    }
  };

  const getBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'HEALTH_ALERT': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'FINANCIAL_ALERT': return 'bg-red-500/10 border-red-500/20';
      case 'SALES_ALERT': return 'bg-brand-500/10 border-brand-500/20';
      case 'REPRODUCTION_ALERT': return 'bg-purple-500/10 border-purple-500/20';
      case 'WAITLIST_MATCH': return 'bg-amber-500/10 border-amber-500/20';
      case 'SYSTEM':
      default: return 'bg-zinc-800 border-zinc-700';
    }
  };

  // Formata "time" a partir do createdAt (ex: "2 min", "3 h", "12/06")
  const formatTime = (iso: string): string => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Notificações"
        className="absolute right-0 top-14 z-50 w-80 sm:w-96 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-4 shrink-0 bg-zinc-900/95 backdrop-blur-md">
          <h3 className="font-bold text-white flex items-center gap-2">
            Notificações
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check size={14} /> Marcar lidas
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 p-3 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto w-full p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm">
              <BellRing size={32} className="mb-2 opacity-40" />
              Nenhuma notificação por aqui
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`group flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors ${notif.isRead ? 'hover:bg-zinc-800/40 opacity-70' : 'bg-zinc-800/40 hover:bg-zinc-800/60'}`}
              >
                <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${getBadgeColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5 gap-2">
                    <h4 className={`text-sm font-bold truncate ${notif.isRead ? 'text-zinc-300' : 'text-zinc-100'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-zinc-500 shrink-0">{formatTime(notif.createdAt)}</span>
                  </div>
                  {notif.description && (
                    <p className="text-xs text-zinc-400 mb-1 leading-snug line-clamp-2">{notif.description}</p>
                  )}
                  {notif.referenceType && (
                    <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver detalhes <ChevronRight size={12} />
                    </div>
                  )}
                </div>
                {!notif.isRead && (
                  <div className="h-2 w-2 rounded-full bg-brand-500 mt-2 shrink-0" aria-label="Não lida"></div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-zinc-800 p-2 shrink-0 bg-zinc-900/95 backdrop-blur-md">
          <button
            onClick={() => {
              // Reaproveita o roteador client-side já existente
              window.history.pushState({}, '', '/notificacoes');
              window.dispatchEvent(new PopStateEvent('popstate'));
              onClose();
            }}
            className="w-full py-2 text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors bg-zinc-800 rounded-lg"
          >
            Ver Central de Notificações
          </button>
        </div>
      </div>
    </>
  );
}
