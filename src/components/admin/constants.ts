export const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  CRIADOR: 'Criador',
  VET: 'Veterinário',
  COMMERCIAL: 'Comercial',
  FINANCIAL: 'Financeiro',
  READONLY: 'Leitura',
};

export const isAdminUser = (u: any) => u.isProtected === true;

export const statusConfig: Record<string, { label: string; class: string }> = {
  ACTIVE: { label: 'Ativo', class: 'bg-emerald-500/10 text-emerald-400' },
  INACTIVE: { label: 'Inativo', class: 'bg-zinc-500/10 text-zinc-400' },
  BLOCKED: { label: 'Bloqueado', class: 'bg-red-500/10 text-red-400' },
};

export const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};
