import { Users, Shield, Edit, Search, Filter, Plus } from 'lucide-react';
import type { UserData } from './types';
import { roleLabels, isAdminUser, statusConfig, formatDate } from './constants';

interface UserTableProps {
  usuarios: UserData[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEditUser: (user: UserData) => void;
  onNewUser: () => void;
}

export function UserTable({ usuarios, searchTerm, onSearchChange, onEditUser, onNewUser }: UserTableProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-4 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Buscar usuário por nome ou username..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700">
            <Filter size={16} /> Filtros
          </button>
        </div>
        <button
          onClick={onNewUser}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors w-full sm:w-auto overflow-hidden"
        >
          <Plus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-300 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuário</th>
                <th className="px-6 py-4 font-semibold">Perfil</th>
                <th className="px-6 py-4 font-semibold">Último Acesso</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                  onClick={() => onEditUser(u)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-brand-500 border border-zinc-700">
                        {(u.name || '?').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-100 group-hover:text-brand-400 transition-colors">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.username}</p>
                        {isAdminUser(u) && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                            <Shield size={10} /> Protegido
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5">
                      <Shield size={14} className={u.role === 'ADMIN' ? 'text-brand-500' : 'text-zinc-500'} />
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{formatDate(u.last_login)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${(statusConfig[u.status] || statusConfig.ACTIVE).class}`}>
                      {(statusConfig[u.status] || statusConfig.ACTIVE).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditUser(u); }}
                      disabled={isAdminUser(u)}
                      aria-label={isAdminUser(u) ? `Administrador protegido - ${u.name}` : `Editar ${u.name}`}
                      title={isAdminUser(u) ? 'Administrador protegido' : `Editar ${u.name}`}
                      className="p-2 text-zinc-400 hover:text-brand-400 transition-colors rounded-lg hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-semibold">Nenhum usuário encontrado</p>
                    <p className="text-xs mt-1">
                      {searchTerm
                        ? 'Tente alterar os termos da busca.'
                        : 'Clique em "Novo Usuário" para começar.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
