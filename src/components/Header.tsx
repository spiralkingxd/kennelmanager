import { Bell, Search } from 'lucide-react';
import { useState, type FormEvent, useCallback } from 'react';
import { NotificationPanel } from './notifications/NotificationPanel';

interface HeaderProps {
  activeGroupTitle: string;
  activeItemLabel: string;
}

export function Header({ activeGroupTitle, activeItemLabel }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const handleUnreadCountChange = useCallback((count: number) => setUnreadCount(count), []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    const path = `/clientes?search=${encodeURIComponent(trimmed)}`;
    const current = window.location.pathname + window.location.search;
    if (current !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-8 backdrop-blur-sm">
      {/* Breadcrumb e Título */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>{activeGroupTitle}</span>
          <span>•</span>
          <span className="font-medium text-brand-500">{activeItemLabel}</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">
          {activeItemLabel}
        </h1>
      </div>

      {/* Ações (Busca, Notificações) */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} role="search" className="relative group hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Buscar animais, clientes..."
            aria-label="Buscar animais, clientes e registros"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-64 rounded-full border border-zinc-700 bg-zinc-800/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </form>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label={isNotificationsOpen ? 'Fechar notificações' : `Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-brand-500 ring-2 ring-zinc-950">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
              </span>
            )}
          </button>
          
          <NotificationPanel
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onUnreadCountChange={handleUnreadCountChange}
          />
        </div>
      </div>
    </header>
  );
}
