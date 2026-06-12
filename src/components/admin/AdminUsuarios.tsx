import React, { useState, useEffect, useCallback } from 'react';
import { nameSchema, emailSchema } from '../../shared/validation/schemas';
import { apiFetch } from '../../shared/utils/apiFetch';
import { UserTable } from './UserTable';
import { UserFormModal } from './UserFormModal';

export function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState('READONLY');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formPassword, setFormPassword] = useState('');

  const fetchData = useCallback(() => {
    apiFetch('/users')
      .then(res => {
        if (res.success) setUsuarios(res.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter users by search term (local filtering)
  const filteredUsuarios = usuarios.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term);
  });

  const openNewUser = () => {
    setSelectedUser(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('READONLY');
    setFormStatus('ACTIVE');
    setFormPassword('');
    setModalError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditUser = (u: any) => {
    setSelectedUser(u);
    setFormName(u.name || '');
    setFormEmail(u.email || '');
    setFormPhone(u.phone || '');
    setFormRole(u.role || 'READONLY');
    setFormStatus(u.status || 'ACTIVE');
    setFormPassword('');
    setModalError('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setModalError('');
    setFieldErrors({});

    const nameResult = nameSchema.safeParse(formName.trim());
    if (!nameResult.success) {
      setFieldErrors(prev => ({ ...prev, name: nameResult.error.issues[0].message }));
      return;
    }
    const emailResult = emailSchema.safeParse(formEmail.trim());
    if (!emailResult.success) {
      setFieldErrors(prev => ({ ...prev, email: emailResult.error.issues[0].message }));
      return;
    }
    if (!selectedUser && !formPassword.trim()) {
      setFieldErrors(prev => ({ ...prev, password: 'Senha é obrigatória para novos usuários.' }));
      return;
    }

    setModalLoading(true);
    try {
      const payload: Record<string, string | undefined> = {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        status: formStatus,
      };
      if (!selectedUser) {
        payload.password = formPassword;
      }

      const url = selectedUser ? `/users/${selectedUser.id}` : '/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const json = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!json.success) {
        throw new Error(json.message || 'Erro ao salvar usuário');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Erro desconhecido');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiFetch(`/users/${id}`, { method: 'DELETE' });
      if (!json.success) throw new Error(json.message || 'Erro ao excluir');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Erro ao excluir');
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Deseja redefinir a senha deste usuário? Uma nova senha temporária será gerada e exibida apenas uma vez.')) return;
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiFetch(`/users/${id}/reset-password`, {
        method: 'POST',
      });
      if (!json.success) throw new Error(json.message || 'Erro ao redefinir senha');
      const tempPwd = json?.data?.tempPassword;
      if (typeof tempPwd === 'string' && tempPwd.length > 0) {
        window.alert(`Senha temporária gerada:\n\n${tempPwd}\n\nCopie e envie ao usuário com segurança. Esta senha não será exibida novamente.`);
      }
    } catch (err: any) {
      setModalError(err.message || 'Erro ao redefinir senha');
    } finally {
      setModalLoading(false);
    }
  };

  const handleBlockUser = async (id: string) => {
    if (!window.confirm('Deseja bloquear o acesso deste usuário?')) return;
    setModalLoading(true);
    setModalError('');
    try {
      const json = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'BLOCKED' }),
      });
      if (!json.success) throw new Error(json.message || 'Erro ao bloquear');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setModalError(err.message || 'Erro ao bloquear');
    } finally {
      setModalLoading(false);
    }
  };

  const onFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'name': setFormName(value); break;
      case 'email': setFormEmail(value); break;
      case 'phone': setFormPhone(value); break;
      case 'role': setFormRole(value); break;
      case 'status': setFormStatus(value); break;
      case 'password': setFormPassword(value); break;
    }
  };

  const onClearFieldError = (field: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <UserTable
        usuarios={filteredUsuarios}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEditUser={openEditUser}
        onNewUser={openNewUser}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedUser={selectedUser}
        formName={formName}
        formEmail={formEmail}
        formPhone={formPhone}
        formRole={formRole}
        formStatus={formStatus}
        formPassword={formPassword}
        fieldErrors={fieldErrors}
        modalLoading={modalLoading}
        modalError={modalError}
        onFieldChange={onFieldChange}
        onClearFieldError={onClearFieldError}
        onSave={handleSave}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        onBlockUser={handleBlockUser}
      />
    </div>
  );
}
