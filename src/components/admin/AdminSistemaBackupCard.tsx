import { HardDrive, ShieldAlert, Download, Upload } from 'lucide-react';

export function AdminSistemaBackupCard() {
  return (
    <div className="rounded-xl border-2 border-red-500/20 bg-zinc-900/50 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500"><HardDrive size={100} /></div>
      <h3 className="text-lg font-bold text-white mb-1 relative z-10 flex items-center gap-2">Backup & Manutenção <ShieldAlert size={18} className="text-red-500" /></h3>
      <p className="text-xs text-zinc-500 mb-6 relative z-10">Ações estruturais e exportação total de dados.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
           <p className="text-sm font-bold text-zinc-200 mb-1">Backup Automático Diário</p>
           <p className="text-[10px] text-zinc-500 mb-4">Salva em nuvem AWS S3. Último: 03:00</p>
           <button className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors">
              Executar Agora
           </button>
        </div>

        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
           <p className="text-sm font-bold text-zinc-200 mb-1">Exportar JSON Total</p>
           <p className="text-[10px] text-zinc-500 mb-4">Exporta todo o DB para backup local manual.</p>
           <button className="w-full flex items-center justify-center gap-2 py-2 border border-brand-500/50 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-lg text-xs font-semibold transition-colors">
              <Download size={14} /> Download ZIP
           </button>
        </div>

        <div className="p-4 bg-zinc-950 border border-red-500/30 rounded-xl">
           <p className="text-sm font-bold text-zinc-200 mb-1">Importar Restauração</p>
           <p className="text-[10px] text-red-400/80 mb-4">Substitui o banco de dados atual. <strong>Risco!</strong></p>
           <button className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors border border-red-500/20">
              <Upload size={14} /> Enviar Arquivo...
           </button>
        </div>
      </div>
    </div>
  );
}
