import React from 'react';
import { Shield, ShieldAlert, HeartPulse, DollarSign, Briefcase, Eye, Check, X, PawPrint } from 'lucide-react';

export function AdminPerfis() {
  const perfis = [
    { title: 'Administrador', desc: 'Acesso total irrestrito a todas as seções e configurações.', icon: ShieldAlert, color: 'text-brand-500', bg: 'bg-brand-500/10', border: 'border-brand-500/20' },
    { title: 'Criador', desc: 'Acesso completo ao canil: animais, saúde, reprodução, ninhadas, clientes, vendas, financeiro e relatórios. Sem acesso ao painel admin.', icon: PawPrint, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { title: 'Veterinário', desc: 'Acesso às fichas de animais, módulos de saúde e reprodução.', icon: HeartPulse, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { title: 'Comercial', desc: 'Acesso ao CRM, clientes e vendas. Sem acesso a custos.', icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { title: 'Financeiro', desc: 'Acesso completo ao financeiro e fluxo de caixa.', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Somente Leitura', desc: 'Pode visualizar o sistema, sem realizar edições.', icon: Eye, color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
  ];

  const permissoes = [
    { module: 'Dashboard Geral', admin: 'edit', criador: 'edit', vet: 'view', com: 'view', fin: 'view', read: 'view' },
    { module: 'Plantel (Animais)', admin: 'edit', criador: 'edit', vet: 'edit', com: 'none', fin: 'none', read: 'view' },
    { module: 'Ninhadas e Filhotes', admin: 'edit', criador: 'edit', vet: 'view', com: 'view', fin: 'none', read: 'view' },
    { module: 'Saúde e Vacinas', admin: 'edit', criador: 'edit', vet: 'edit', com: 'none', fin: 'none', read: 'view' },
    { module: 'Reprodução e Cios', admin: 'edit', criador: 'edit', vet: 'edit', com: 'none', fin: 'none', read: 'view' },
    { module: 'CRM e Clientes', admin: 'edit', criador: 'edit', vet: 'none', com: 'edit', fin: 'view', read: 'view' },
    { module: 'Vendas (Funil + Registro)', admin: 'edit', criador: 'edit', vet: 'none', com: 'edit', fin: 'view', read: 'view' },
    { module: 'Lista de Espera', admin: 'edit', criador: 'edit', vet: 'none', com: 'edit', fin: 'view', read: 'view' },
    { module: 'Calendário', admin: 'edit', criador: 'edit', vet: 'edit', com: 'edit', fin: 'edit', read: 'view' },
    { module: 'Financeiro: Despesas', admin: 'edit', criador: 'edit', vet: 'none', com: 'none', fin: 'edit', read: 'view' },
    { module: 'Financeiro: Receitas', admin: 'edit', criador: 'edit', vet: 'none', com: 'edit', fin: 'edit', read: 'view' },
    { module: 'Relatórios e Métricas', admin: 'edit', criador: 'edit', vet: 'view', com: 'view', fin: 'edit', read: 'view' },
    { module: 'Config. do Sistema', admin: 'edit', criador: 'none', vet: 'none', com: 'none', fin: 'none', read: 'none' },
  ];

  const renderIcon = (status: string) => {
    if (status === 'view') return <Eye size={16} className="text-zinc-400 mx-auto" />;
    if (status === 'edit') return <Check size={16} className="text-emerald-500 mx-auto" />;
    return <X size={16} className="text-red-500 mx-auto" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Lista de Perfis Padrão */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perfis.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className={`p-5 rounded-xl border ${p.border} ${p.bg} bg-opacity-20`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-zinc-900 border ${p.border}`}>
                  <Icon size={20} className={p.color} />
                </div>
                <h3 className="font-bold text-white">{p.title}</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
            </div>
          )
        })}
        
        {/* Placeholder para Novo Perfil (Opcional - visual apenas) */}
        <div className="p-5 rounded-xl border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 hover:text-brand-400 hover:border-brand-500 cursor-pointer transition-colors min-h-[120px]">
          <Shield size={24} className="mb-2" />
          <span className="text-sm font-semibold">Criar Perfil Personalizado</span>
        </div>
      </div>

      {/* Tabela de Permissões (Matriz) */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-800/30">
          <h3 className="font-bold text-white flex items-center gap-2">Matriz de Permissões</h3>
          <p className="text-xs text-zinc-500 mt-1">Visão geral do acesso granular por módulo de cada perfil padrão.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-zinc-400">
             <thead className="bg-zinc-800/20 text-xs text-zinc-400 border-b border-zinc-800">
               <tr>
                  <th className="px-4 py-4 text-left font-semibold w-1/4">Módulo do Sistema</th>
                  <th className="px-2 py-4 font-semibold text-brand-400">Administrador</th>
                  <th className="px-2 py-4 font-semibold text-purple-400">Criador</th>
                  <th className="px-2 py-4 font-semibold text-sky-400">Veterinário</th>
                  <th className="px-2 py-4 font-semibold text-amber-400">Comercial</th>
                  <th className="px-2 py-4 font-semibold text-emerald-400">Financeiro</th>
                  <th className="px-2 py-4 font-semibold text-zinc-400">Somente Leitura</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-800/50">
               {permissoes.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3 text-left font-medium text-zinc-300">{perm.module}</td>
                    <td className="px-2 py-3 bg-brand-500/5">{renderIcon(perm.admin)}</td>
                    <td className="px-2 py-3 bg-purple-500/5">{renderIcon(perm.criador)}</td>
                    <td className="px-2 py-3 bg-sky-500/5">{renderIcon(perm.vet)}</td>
                    <td className="px-2 py-3 bg-amber-500/5">{renderIcon(perm.com)}</td>
                    <td className="px-2 py-3 bg-emerald-500/5">{renderIcon(perm.fin)}</td>
                    <td className="px-2 py-3 bg-zinc-500/5">{renderIcon(perm.read)}</td>
                  </tr>
               ))}
             </tbody>
          </table>
        </div>
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-center gap-6 text-xs text-zinc-500">
           <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500"/> Editar / Criar</span>
           <span className="flex items-center gap-1.5"><Eye size={14} className="text-zinc-400"/> Visualizar</span>
           <span className="flex items-center gap-1.5"><X size={14} className="text-red-500"/> Sem Acesso</span>
        </div>
      </div>

    </div>
  );
}
