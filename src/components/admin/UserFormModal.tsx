import { X, Shield, AlertCircle, Plus, KeyRound, UserX, Trash2, Loader2 } from 'lucide-react';
import type { UserData } from './types';
import { isAdminUser } from './constants';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: UserData | null;
  formName: string;
  formUsername: string;
  formPhone: string;
  formRole: string;
  formStatus: string;
  formPassword: string;
  fieldErrors: Record<string, string>;
  modalLoading: boolean;
  modalError: string;
  onFieldChange: (field: string, value: string) => void;
  onClearFieldError: (field: string) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onResetPassword: (id: string) => void;
  onBlockUser: (id: string) => void;
}

export function UserFormModal({
  isOpen,
  onClose,
  selectedUser,
  formName,
  formUsername,
  formPhone,
  formRole,
  formStatus,
  formPassword,
  fieldErrors,
  modalLoading,
  modalError,
  onFieldChange,
  onClearFieldError,
  onSave,
  onDelete,
  onResetPassword,
  onBlockUser,
}: UserFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h3 className="text-lg font-bold text-white">
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-zinc-500 hover:text-zinc-300 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {modalError && (
            <div role="alert" className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm text-red-400">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {selectedUser && isAdminUser(selectedUser) && (
            <div role="status" className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-start gap-2 text-sm text-brand-400">
              <Shield size={16} className="mt-0.5 shrink-0" />
              <span>Este é o administrador principal do sistema. Algumas alterações são restritas.</span>
            </div>
          )}

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:border-brand-500 hover:text-brand-500 transition-colors">
              {selectedUser ? (
                <span className="text-2xl font-bold uppercase text-brand-500">
                  {(selectedUser.name || '?').substring(0, 2)}
                </span>
              ) : (
                <>
                  <Plus size={24} />
                  <span className="text-xs font-semibold mt-1">Foto</span>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Nome Completo *</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => { onFieldChange('name', e.target.value); onClearFieldError('name'); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-brand-500 outline-none"
            />
            {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Username *</label>
            <input
              type="text"
              value={formUsername}
              onChange={(e) => { onFieldChange('username', e.target.value); onClearFieldError('username'); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-brand-500 outline-none"
            />
            {fieldErrors.username && <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Telefone</label>
            <input
              type="text"
              value={formPhone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Perfil de Acesso *</label>
            <select
              value={formRole}
              onChange={(e) => onFieldChange('role', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-brand-500 outline-none appearance-none"
            >
              <option value="ADMIN">Administrador</option>
              <option value="CRIADOR">Criador</option>
              <option value="VET">Veterinário</option>
              <option value="COMMERCIAL">Comercial</option>
              <option value="FINANCIAL">Financeiro</option>
              <option value="READONLY">Leitura</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Status</label>
            <select
              value={formStatus}
              onChange={(e) => onFieldChange('status', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-brand-500 outline-none appearance-none"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="BLOCKED">Bloqueado</option>
            </select>
          </div>

          {!selectedUser && (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Senha *</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => { onFieldChange('password', e.target.value); onClearFieldError('password'); }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:border-brand-500 outline-none"
                />
                {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
              </div>
              <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl mt-4">
                <p className="text-sm font-semibold text-brand-400 mb-3 flex items-center gap-2">
                  <KeyRound size={16} /> Configurações de Senha
                </p>
                <label className="flex items-start gap-2 cursor-pointer mb-2">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span className="text-sm text-zinc-300">Gerar senha temporária e enviar por e-mail</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span className="text-sm text-zinc-300">Forçar troca de senha no 1º acesso</span>
                </label>
              </div>
            </>
          )}

          {selectedUser && (
            <div className="pt-6 border-t border-zinc-800 space-y-3 mt-6">
              <button
                onClick={() => onResetPassword(selectedUser.id)}
                disabled={modalLoading || isAdminUser(selectedUser)}
                aria-label={isAdminUser(selectedUser) ? 'Administrador protegido - Redefinir senha indisponível' : 'Redefinir senha do usuário'}
                title={isAdminUser(selectedUser) ? 'Administrador protegido' : undefined}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <KeyRound size={16} /> Redefinir Senha
              </button>
              <button
                onClick={() => onBlockUser(selectedUser.id)}
                disabled={modalLoading || isAdminUser(selectedUser)}
                aria-label={isAdminUser(selectedUser) ? 'Administrador protegido - Bloquear acesso indisponível' : 'Bloquear acesso do usuário'}
                title={isAdminUser(selectedUser) ? 'Administrador protegido' : undefined}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <UserX size={16} /> Bloquear Acesso
              </button>
              <button
                onClick={() => onDelete(selectedUser.id)}
                disabled={modalLoading || isAdminUser(selectedUser)}
                aria-label={isAdminUser(selectedUser) ? 'Administrador protegido - Excluir cadastro indisponível' : 'Excluir cadastro do usuário'}
                title={isAdminUser(selectedUser) ? 'Administrador protegido' : undefined}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} /> Excluir Cadastro
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex gap-3">
          <button
            onClick={onClose}
            disabled={modalLoading}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={modalLoading}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {modalLoading && <Loader2 size={16} className="animate-spin" />}
            {modalLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
