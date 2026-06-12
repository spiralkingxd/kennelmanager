import { FileText, Plus } from 'lucide-react';

interface ExamsSectionProps {
  exams: any[];
  formatDate: (d: string) => string;
  onAdd: () => void;
  onDelete: (target: { id: string; type: string }) => void;
}

export function ExamsSection({ exams, formatDate, onAdd, onDelete }: ExamsSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">Exames Oficiais e Laboratoriais</h3>
        <button onClick={onAdd} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Anexar Laudo
        </button>
      </div>
      {exams.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhum exame registrado.</p>
      ) : (
      <div className="space-y-4">
        {exams.map((exam: any) => (
          <div key={exam.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${exam.is_pre_reproduction ? 'border-brand-500/30 bg-brand-500/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
            <div className="flex gap-4">
              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${exam.is_pre_reproduction ? 'bg-brand-500/20 text-brand-500' : 'bg-zinc-800 text-zinc-400'}`}>
                <FileText size={18} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100">{exam.type}</span>
                  {exam.is_pre_reproduction && <span className="bg-brand-500/20 border border-brand-500/50 text-brand-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">Pré-Reprodutivo</span>}
                </div>
                <span className="text-sm text-emerald-400 font-medium mt-1">Resultado: {exam.result || 'Pendente'}</span>
                <span className="text-xs text-zinc-500 mt-1">Realizado em {formatDate(exam.date)} por {exam.vet_name || '-'}</span>
              </div>
            </div>
            {exam.result_file_url && (
              <a href={exam.result_file_url} target="_blank" rel="noopener noreferrer" className="sm:ml-auto w-full sm:w-auto px-4 py-2 rounded border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors text-center">
                Baixar PDF
              </a>
            )}
            <button onClick={() => onDelete({ id: exam.id, type: 'exams' })}
              className="text-xs text-red-500 hover:text-red-400 ml-3">Excluir</button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
