import React, { useState } from 'react';
import { 
  ShieldAlert, Users, Key, History, Settings, Activity, Database, Server, Clock, Download, Plus, Search, Filter, MoreHorizontal, UserCheck, UserX, Mail, Lock, Upload, Save, CheckCircle
} from 'lucide-react';
import { AdminVisaoGeral } from './AdminVisaoGeral';
import { AdminUsuarios } from './AdminUsuarios';
import { AdminPerfis } from './AdminPerfis';
import { AdminAuditoria } from './AdminAuditoria';
import { AdminSistema } from './AdminSistema';

export function AdminManager() {
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'usuarios' | 'perfis' | 'auditoria' | 'sistema'>('visao_geral');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <ShieldAlert className="text-brand-500" />
            Painel de Administração
          </h2>
          <p className="text-sm text-zinc-500">Área exclusiva para gerenciamento estrutural e segurança do sistema.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Settings */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('visao_geral')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'visao_geral' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            <Activity size={18} />
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'usuarios' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            <Users size={18} />
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('perfis')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'perfis' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            <Key size={18} />
            Perfis e Permissões
          </button>
          <button 
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'auditoria' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            <History size={18} />
            Log de Auditoria
          </button>
          <button 
            onClick={() => setActiveTab('sistema')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'sistema' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
          >
            <Settings size={18} />
            Configurações do Sistema
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'visao_geral' && <AdminVisaoGeral />}
          {activeTab === 'usuarios' && <AdminUsuarios />}
          {activeTab === 'perfis' && <AdminPerfis />}
          {activeTab === 'auditoria' && <AdminAuditoria />}
          {activeTab === 'sistema' && <AdminSistema />}
        </div>
      </div>
    </div>
  );
}
