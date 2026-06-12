import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { Modal } from '../plantel/modals/Modal';
import { apiFetch } from '../../shared/utils/apiFetch';

interface SaleItem { id: string; status: string; value: string; created_at: string }
interface CIItem { id: string; type: string; description: string; created_at: string }
interface DocItem { id: string; type: string; name: string; created_at: string }
interface WLItem { id: string; preferred_breed: string; max_price: string; created_at: string }
interface PupItem { id: string; name: string; sex: string; status: string; color: string; created_at: string }
interface FTItem { id: string; type: string; amount: string; status: string; created_at: string }
interface AniItem { id: string; name: string; breed: string; created_at: string }
interface CEItem { id: string; title: string; date: string; category: string; created_at: string }

interface ImpactData {
  counts: {
    sales: number;
    client_interactions: number;
    documents: number;
    waitlist: number;
    puppies: number;
    financial_transactions: number;
    animals: number;
    calendar_events: number;
  };
  details: {
    sales: SaleItem[];
    client_interactions: CIItem[];
    documents: DocItem[];
    waitlist: WLItem[];
    puppies: PupItem[];
    financial_transactions: FTItem[];
    animals: AniItem[];
    calendar_events: CEItem[];
  };
  hasActiveNegotiations: boolean;
}

interface ClienteDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  clienteName: string;
  onDeleted: () => void;
}

type State = 'loading' | 'impact' | 'blocked' | 'confirming' | 'success' | 'error';

type CategoryKey = keyof ImpactData['counts'];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  sales: 'Vendas registradas',
  client_interactions: 'Interações registradas',
  documents: 'Documentos anexados',
  waitlist: 'Lista de Espera',
  puppies: 'Filhotes adquiridos',
  financial_transactions: 'Transações financeiras',
  animals: 'Animais vinculados',
  calendar_events: 'Eventos na agenda',
};

function formatDate(d: string) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR');
}

function formatCurrency(v: string) {
  const n = parseFloat(v);
  if (isNaN(n)) return v;
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

function CategoryDetail({ category, items, count }: { category: CategoryKey; items: any[]; count: number }) {
  const [open, setOpen] = useState(false);
  if (count === 0) return null;

  return (
    <div className="border-b border-zinc-800/80 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-zinc-800/30 transition-colors text-left"
      >
        <span className="flex items-center gap-2">
          {open ? <ChevronDown size={14} className="text-zinc-500 shrink-0" /> : <ChevronRight size={14} className="text-zinc-500 shrink-0" />}
          <span className="text-zinc-300">{CATEGORY_LABELS[category]}</span>
        </span>
        <span className="font-semibold text-zinc-100 ml-2">{count}</span>
      </button>
      {open && items.length > 0 && (
        <div className="px-4 pb-2 space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded bg-zinc-800/20 px-3 py-1.5 text-xs text-zinc-400">
              <span className="truncate mr-2">{renderItemLabel(category, item)}</span>
              <span className="shrink-0 text-zinc-500">{formatDate(item.created_at)}</span>
            </div>
          ))}
          {count > items.length && (
            <p className="text-xs text-zinc-600 px-3 pt-1">
              ...e mais {count - items.length} registro{(count - items.length) !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function renderItemLabel(category: CategoryKey, item: any): string {
  switch (category) {
    case 'sales':
      return `${STATUS_LABELS[item.status] || item.status} — ${formatCurrency(item.value)}`;
    case 'client_interactions':
      return `${item.type}: ${item.description || '(sem descrição)'}`;
    case 'documents':
      return `${item.type} — ${item.name || '(sem nome)'}`;
    case 'waitlist':
      return `${item.preferred_breed || 'Raça não informada'}${item.max_price ? ` — ${formatCurrency(item.max_price)}` : ''}`;
    case 'puppies':
      return `${item.name || '(sem nome)'} — ${item.sex || ''}${item.color ? ` (${item.color})` : ''} [${item.status || ''}]`;
    case 'financial_transactions':
      return `${item.type === 'INCOME' ? 'Receita' : 'Despesa'} — ${formatCurrency(item.amount)} (${item.status})`;
    case 'animals':
      return `${item.name || '(sem nome)'} — ${item.breed || ''}`.replace(/ — $/, '');
    case 'calendar_events':
      return `${item.title || '(sem título)'} — ${item.category || ''}`.replace(/ — $/, '');
    default:
      return item.name || item.title || item.id || '(registro)';
  }
}

export function ClienteDeleteModal({ isOpen, onClose, clienteId, clienteName, onDeleted }: ClienteDeleteModalProps) {
  const [state, setState] = useState<State>('loading');
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setState('loading');
    setImpact(null);
    setErrorMsg('');
    apiFetch(`/clients/${clienteId}/impact`)
      .then(res => {
        if (res.success && res.data) {
          setImpact(res.data);
          setState(res.data.hasActiveNegotiations ? 'blocked' : 'impact');
        } else {
          setErrorMsg(res.message || 'Erro ao carregar dados');
          setState('error');
        }
      })
      .catch(() => {
        setErrorMsg('Erro de conexão ao servidor');
        setState('error');
      });
  }, [isOpen, clienteId]);

  const handleDelete = async () => {
    setState('confirming');
    setErrorMsg('');
    try {
      const json = await apiFetch(`/clients/${clienteId}`, { method: 'DELETE' });
      if (json.success) {
        setState('success');
      } else {
        setErrorMsg(json.message || 'Erro ao excluir');
        setState('error');
      }
    } catch {
      setErrorMsg('Erro de conexão');
      setState('error');
    }
  };

  const categoriesWithData = impact
    ? (Object.keys(CATEGORY_LABELS) as CategoryKey[]).filter(k => impact.counts[k] > 0)
    : [];

  const totalRecords = impact
    ? (Object.values(impact.counts) as number[]).reduce((s, v) => s + v, 0)
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Excluir Cliente" size="md">
      {/* Loading */}
      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-brand-500 mb-4" />
          <p className="text-sm text-zinc-400">Verificando dados vinculados...</p>
        </div>
      )}

      {/* Blocked: active negotiations */}
      {state === 'blocked' && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-6">
            <div className="rounded-full bg-red-500/10 p-4 mb-4">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-red-400 mb-2">Exclusão Bloqueada</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              O cliente <strong className="text-zinc-200">{clienteName}</strong>{' '}
              possui negociações ativas no Funil de Vendas.
            </p>
          </div>
          <div className="rounded-lg bg-red-500/5 border border-red-800/50 p-4">
            <p className="text-xs text-red-400 leading-relaxed">
              Finalize ou cancele todas as negociações ativas antes de excluir este cliente.
              Isso preserva a integridade dos dados financeiros e do histórico de vendas.
            </p>
          </div>
          <div className="flex justify-end pt-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* Impact preview with details */}
      {state === 'impact' && impact && (
        <div className="space-y-4">
          <div className="flex flex-col items-center text-center py-4">
            <div className="rounded-full bg-amber-500/10 p-4 mb-4">
              <AlertTriangle size={36} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mb-1">Confirmar Exclusão</h3>
            <p className="text-sm text-zinc-400 max-w-md">
              Tem certeza que deseja excluir <strong className="text-zinc-200">{clienteName}</strong>?
            </p>
          </div>

          {totalRecords > 0 ? (
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800/50 border-b border-zinc-700">
                <span className="text-xs font-semibold uppercase text-zinc-400">
                  {totalRecords} registro{totalRecords !== 1 ? 's' : ''} vinculado{totalRecords !== 1 ? 's' : ''} — clique para detalhes:
                </span>
              </div>
              <div className="divide-y divide-zinc-800/80">
                {categoriesWithData.map(cat => (
                  <div key={cat}>
                    <CategoryDetail
                      category={cat}
                      items={impact.details[cat] as any[]}
                      count={impact.counts[cat]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 px-4 py-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-sm text-zinc-300">Nenhum registro vinculado encontrado.</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              Sim, excluir permanentemente
            </button>
          </div>
        </div>
      )}

      {/* Confirming (deleting) */}
      {state === 'confirming' && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-red-400 mb-4" />
          <p className="text-sm text-zinc-400">Excluindo cliente...</p>
        </div>
      )}

      {/* Success */}
      {state === 'success' && (
        <div className="flex flex-col items-center text-center py-8">
          <div className="rounded-full bg-emerald-500/10 p-4 mb-4">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">Cliente Excluído</h3>
          <p className="text-sm text-zinc-400 mb-6">
            {clienteName} e todos os registros vinculados foram removidos.
          </p>
          <button
            onClick={() => { onDeleted(); onClose(); }}
            className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div className="flex flex-col items-center text-center py-8">
          <div className="rounded-full bg-red-500/10 p-4 mb-4">
            <AlertCircle size={36} className="text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-red-400 mb-1">Erro ao excluir</h3>
          <p className="text-sm text-zinc-400 mb-6">{errorMsg || 'Tente novamente mais tarde.'}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
