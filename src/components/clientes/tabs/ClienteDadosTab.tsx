import { MapPin, Phone, Mail, Calendar, Info, FileText } from 'lucide-react';

export function ClienteDadosTab({ cliente }: { cliente: any }) {
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="space-y-8">
          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <Info size={16} className="text-zinc-500" /> Informações Pessoais
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Nome Completo</span>
                 <span className="text-sm font-medium text-zinc-200">{cliente.name || 'Não informado'}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Profissão</span>
                 <span className="text-sm font-medium text-zinc-200">{cliente.profession || 'Não informada'}</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Data de Nascimento</span>
                 <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5">
                   <Calendar size={14} className="text-zinc-500" />
                   {cliente.birth_date ? formatDate(cliente.birth_date) : 'Não informada'}
                 </span>
               </div>
              </div>
          </section>

          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <Info size={16} className="text-zinc-500" /> Como nos Conheceu
             </h3>
             <div className="flex flex-col gap-2 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
               <span className="inline-flex w-max items-center rounded-md bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-300">
                 {cliente.how_found_us || 'Não informado'}
               </span>
             </div>
          </section>
       </div>

       <div className="space-y-8">
          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <Phone size={16} className="text-zinc-500" /> Contato e Endereço
             </h3>
             <div className="grid grid-cols-1 gap-6 bg-zinc-900/50 rounded-xl p-5 border border-zinc-800">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="flex flex-col gap-1">
                   <span className="text-xs text-zinc-500">Telefone</span>
                   <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><Phone size={14} className="text-zinc-500"/> {cliente.phone || 'Não informado'}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-xs text-zinc-500">Telefone Secundário</span>
                   <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><Phone size={14} className="text-zinc-500"/> {cliente.secondary_phone || 'Não informado'}</span>
                 </div>
               </div>

               <div className="flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">E-mail</span>
                 <span className="text-sm font-medium text-zinc-200 flex items-center gap-1.5"><Mail size={14} className="text-zinc-500"/> {cliente.email || 'Não informado'}</span>
               </div>

               <div className="pt-4 border-t border-zinc-800 flex flex-col gap-1">
                 <span className="text-xs text-zinc-500">Endereço Completo</span>
                 <span className="text-sm font-medium text-zinc-200 flex items-start gap-1.5 mt-1">
                    <MapPin size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                    <span>
                      {cliente.address || cliente.city || cliente.state
                        ? `${cliente.address ? `${cliente.address} - ` : ''}${cliente.city ? `${cliente.city}, ` : ''}${cliente.state || ''}${cliente.zip_code ? ` - CEP: ${cliente.zip_code}` : ''}`
                        : 'Não informado'}
                    </span>
                 </span>
               </div>
             </div>
          </section>

          <section>
             <h3 className="mb-4 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-2">
               <FileText size={16} className="text-zinc-500" /> Observações Gerais
             </h3>
             <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-5 mt-2 min-h-[100px]">
               {cliente.notes ? (
                 <p className="text-sm text-zinc-300 whitespace-pre-line">{cliente.notes}</p>
               ) : (
                 <p className="text-sm text-zinc-500 italic">Nenhuma observação registrada.</p>
               )}
             </div>
          </section>

          {cliente.created_at && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
              <Calendar size={12} />
              Cadastro em: {formatDate(cliente.created_at)}
            </div>
          )}
       </div>
    </div>
  );
}
