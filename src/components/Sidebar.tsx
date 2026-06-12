import {
  LayoutDashboard,
  Dog,
  Baby,
  PawPrint,
  Users,
  ClipboardList,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  PieChart,
  Activity,
  HeartPulse,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import React, { useState } from 'react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export const menuGroups: MenuGroup[] = [
  {
    title: 'Painel',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'calendario', label: 'Calendário Unificado', icon: CalendarIcon },
    ],
  },
  {
    title: 'Animais',
    items: [
      { id: 'plantel', label: 'Plantel', icon: Dog },
      { id: 'ninhadas', label: 'Ninhadas', icon: Baby },
      { id: 'filhotes', label: 'Disponibilidade', icon: PawPrint },
    ],
  },
  {
    title: 'Clientes e Vendas',
    items: [
      { id: 'espera', label: 'Lista de Espera', icon: ClipboardList },
      { id: 'clientes', label: 'Clientes (CRM)', icon: Users },
      { id: 'vendas', label: 'Registro de Vendas', icon: ShoppingCart },
    ],
  },
  {
    title: 'Saúde e Reprodução',
    items: [
      { id: 'saude', label: 'Controle de Saúde', icon: HeartPulse },
      { id: 'reproducao', label: 'Controle Reprodutivo', icon: Activity },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { id: 'financeiro', label: 'Controle Financeiro', icon: DollarSign },
      { id: 'custos', label: 'Custos por Animal', icon: Activity },
      { id: 'relatorios', label: 'Relatórios', icon: PieChart },
    ],
  },
  {
    title: 'Administração',
    items: [
      { id: 'admin', label: 'Painel Admin', icon: Shield },
    ],
  },
];

interface SidebarProps {
  activeItemId: string;
  setActiveItemId: (id: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  user?: { id: string; email: string; role: string; name?: string } | null;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  CRIADOR: 'Criador',
  VET: 'Veterinário',
  COMMERCIAL: 'Comercial',
  FINANCIAL: 'Financeiro',
  READONLY: 'Leitura',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
}

export function Sidebar({ activeItemId, setActiveItemId, isCollapsed, setIsCollapsed, onLogout, user }: SidebarProps) {
  const isAdmin = user?.role === 'ADMIN';
  // Hide "Administração" section for non-admin users
  const visibleGroups = menuGroups.filter(g => g.title === 'Administração' ? isAdmin : true);

  return (
    <aside
      className={`relative flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Botão de colapsar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expandir navegação' : 'Recolher navegação'}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800 z-10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header do Logo */}
      <div className="flex h-16 items-center justify-center border-b border-zinc-800/50">
        <div className="flex items-center gap-3 overflow-hidden px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-lg shadow-brand-500/20">
            <Dog size={20} />
          </div>
          {!isCollapsed && (
            <span className="truncate whitespace-nowrap text-lg font-bold tracking-tight text-zinc-100">
              Kennel<span className="text-brand-500">Pro</span>
            </span>
          )}
        </div>
      </div>

      {/* Area de Navegação Rolável */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        <nav className="flex flex-col gap-6 p-4">
          {visibleGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              {/* Título do Grupo */}
              {!isCollapsed && (
                <span className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {group.title}
                </span>
              )}
              {isCollapsed && groupIdx !== 0 && (
                <div className="mx-auto mb-2 h-px w-8 bg-zinc-800" />
              )}

              {/* Itens */}
              {group.items.map((item) => {
                const isActive = activeItemId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItemId(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="shrink-0 transition-transform group-hover:scale-110"
                    />
                    {!isCollapsed && (
                      <span className="truncate text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer do Usuário */}
      <div className="border-t border-zinc-800/50 p-4">
        {isCollapsed ? (
            <button onClick={onLogout} className="flex mx-auto h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Sair do sistema">
              <LogOut size={20} />
            </button>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-300">
                {getInitials(user?.name || user?.email)}
              </div>
              <div className="flex flex-col">
                <span className="truncate text-sm font-medium text-zinc-200">{user?.name || user?.email || 'Usuário'}</span>
                <span className="truncate text-xs text-zinc-500">{user?.role ? (roleLabels[user.role] || user.role) : ''}</span>
              </div>
            </div>
            <button 
              onClick={onLogout} 
              aria-label="Sair do sistema"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors shrink-0"
              title="Sair do sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
