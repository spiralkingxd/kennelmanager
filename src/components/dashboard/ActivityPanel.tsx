import { Clock, FlaskConical } from 'lucide-react';

interface ActivityItem {
  id: string;
  action?: string;
  event_type?: string;
  created_at?: string;
  user_name?: string;
}

interface ActivityPanelProps {
  activities: ActivityItem[];
  navigateTo?: (id: string) => void;
}

export function ActivityPanel({ activities, navigateTo }: ActivityPanelProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
      <h3 className="font-bold text-white flex items-center gap-2 mb-4">
        <Clock size={18} className="text-zinc-400" /> Atividade Recente
      </h3>

      <div className="space-y-3 flex-1">
        {activities.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhuma atividade registrada recentemente</p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-zinc-800/30 transition-colors"
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-brand-500/10 text-brand-500 shrink-0">
                <FlaskConical size={14} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-zinc-200 text-xs truncate">{act.action || act.event_type || 'Ação'}</p>
                <p className="text-[10px] text-zinc-500">
                  {act.created_at ? new Date(act.created_at).toLocaleString('pt-BR') : ''}
                  {act.user_name ? ` • ${act.user_name}` : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigateTo?.('admin')}
        className="mt-5 w-full text-center text-xs font-semibold text-brand-500 hover:text-brand-400 transition-colors bg-zinc-800/50 py-2 rounded-lg hover:bg-zinc-800"
      >
        Ver Histórico Completo (Admin)
      </button>
    </div>
  );
}
