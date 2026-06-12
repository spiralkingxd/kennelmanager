import { FileText, Download, Eye, Upload, FileSignature, ImageIcon, AlertCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch } from '../../../shared/utils/apiFetch';
import { DocumentUploadModal } from '../modals/DocumentUploadModal';
import { ConfirmDelete } from '../modals/ConfirmDelete';

const typeIconMap: Record<string, any> = {
  PEDIGREE: FileSignature,
  CERTIFICATE: FileText,
  EXAM_REPORT: FileText,
  PURCHASE_CONTRACT: FileText,
  SALE_CONTRACT: FileText,
  PHOTO: ImageIcon,
  OTHER: FileText,
};

export function PlantelDocsTab({ dog }: { dog: any }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    apiFetch(`/documents/animal/${dog.id}`)
      .then(res => {
        if (res.success) { setDocs(res.data); setError(null); }
        else { setError('Erro ao carregar documentos'); }
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [dog.id]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-zinc-500">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
      Carregando documentos...
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-64 items-center justify-center text-zinc-500 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p>{error}</p>
      <button onClick={fetchData} className="text-sm text-brand-500 hover:underline">Tentar novamente</button>
    </div>
  );

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center mb-2">
         <div>
           <h3 className="text-lg font-bold text-white">Documentos e Anexos</h3>
           <p className="text-sm text-zinc-500">Gerencie pedigrees, laudos e fotos oficiais de {dog.name}</p>
         </div>
         <button
            onClick={() => setDocModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-bold text-white hover:bg-brand-400 transition-colors"
          >
            <Upload size={16} />
            Novo Documento
          </button>
      </div>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/20">
          <Upload size={40} className="text-zinc-700 mb-3" />
          <p className="text-sm font-medium text-zinc-400 mb-1">Nenhum documento cadastrado</p>
          <p className="text-xs text-zinc-600">Clique em {`"`}Novo Documento{`"`} para adicionar</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map((doc: any) => {
          const Icon = typeIconMap[doc.type] || FileText;
          return (
          <div key={doc.id} className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-800/60 hover:border-zinc-700">
             
             <div className="flex items-start gap-4 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                  <Icon size={20} />
                </div>
                <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                  <span className="truncate text-sm font-semibold text-zinc-200" title={doc.name}>{doc.name}</span>
                  <span className="text-xs text-zinc-500">Adicionado em {formatDate(doc.created_at)}</span>
                  {doc.file_size && <span className="text-[10px] text-zinc-600">{(doc.file_size / 1024).toFixed(0)} KB</span>}
                </div>
             </div>

             {doc.description && (
               <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{doc.description}</p>
             )}
             
              <div className="grid grid-cols-3 gap-2 mt-auto">
                 <a href={doc.file_path} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1.5 justify-center rounded bg-zinc-800/80 px-2 py-1.5 text-xs font-medium text-zinc-300 hover:bg-brand-500 hover:text-white transition-colors">
                    <Eye size={14} />
                    Ver
                 </a>
                 <a href={doc.file_path} download
                   className="flex items-center gap-1.5 justify-center rounded bg-zinc-800/80 px-2 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">
                    <Download size={14} />
                    Baixar
                 </a>
                 <button
                   onClick={() => setDeleteTarget(doc.id)}
                   className="flex items-center gap-1.5 justify-center rounded bg-red-900/20 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
                 >
                    <Trash2 size={14} />
                    Excluir
                 </button>
              </div>
             
          </div>
          );
        })}
      </div>
      )}

      <DocumentUploadModal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        onSaved={fetchData}
        animalId={dog.id}
      />

      <ConfirmDelete
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            const json = await apiFetch(`/documents/${deleteTarget}`, { method: 'DELETE' });
            if (json.success) { fetchData(); setDeleteTarget(null); }
          } catch {} finally { setDeleting(false); }
        }}
      />
    </div>
  );
}
