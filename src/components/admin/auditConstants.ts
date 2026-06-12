export const ACTION_LABEL: Record<string, string> = {
  CREATED: 'Criou',
  UPDATED: 'Editou',
  DELETED: 'Excluiu',
  VIEWED: 'Visualizou',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  PASSWORD_RESET: 'Redefiniu Senha',
};

export const ACTION_COLOR: Record<string, string> = {
  CREATED: 'bg-emerald-500/10 text-emerald-400',
  UPDATED: 'bg-amber-500/10 text-amber-400',
  DELETED: 'bg-red-500/10 text-red-400',
  VIEWED: 'bg-sky-500/10 text-sky-400',
  LOGIN: 'bg-blue-500/10 text-blue-400',
  LOGOUT: 'bg-zinc-500/10 text-zinc-400',
  PASSWORD_RESET: 'bg-purple-500/10 text-purple-400',
};

export const ENTITY_LABEL: Record<string, string> = {
  animal: 'Animal',
  client: 'Cliente',
  puppy: 'Filhote',
  litter: 'Ninhada',
  financial_transaction: 'Financeiro',
  user: 'Usuário',
  vaccine: 'Vacina',
  deworming: 'Vermífugo',
  exam: 'Exame',
  consultation: 'Consulta',
  medication: 'Medicação',
  heat_cycle: 'Cio',
  mating: 'Cobertura',
  gestation: 'Gestação',
  waitlist: 'Lista de Espera',
  calendar_event: 'Evento',
  document: 'Documento',
  system_config: 'Configuração',
  sales: 'Registro de Vendas',
  client_interaction: 'Interação',
  notification: 'Notificação',
};

export const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo o período' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
];

export const ACTION_OPTIONS = Object.entries(ACTION_LABEL).map(([key, label]) => ({ value: key, label }));

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR');
}
