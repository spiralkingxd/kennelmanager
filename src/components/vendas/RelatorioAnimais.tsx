import { Dog, TrendingUp } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RelatorioAnimaisProps {
  animalsTotal: number;
  bySex: { MALE: number; FEMALE: number };
  byStatus: Record<string, number>;
  breedPopData: { name: string; value: number }[];
  statusPopData: { name: string; value: number }[];
  sexPopData: { name: string; value: number; color: string }[];
}

export function RelatorioAnimais({
  animalsTotal,
  bySex,
  byStatus,
  breedPopData,
  statusPopData,
  sexPopData,
}: RelatorioAnimaisProps) {
  return (
    <div className="space-y-6">
      {/* Population cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <Dog size={20} className="text-brand-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">Total de Animais</span>
          <span className="text-2xl font-bold text-white">{animalsTotal}</span>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <Dog size={20} className="text-blue-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500/80 block mb-1">Machos</span>
          <span className="text-2xl font-bold text-blue-400">{bySex.MALE}</span>
        </div>
        <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-5">
          <Dog size={20} className="text-pink-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-pink-500/80 block mb-1">Fêmeas</span>
          <span className="text-2xl font-bold text-pink-400">{bySex.FEMALE}</span>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <TrendingUp size={20} className="text-emerald-500 mb-2" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500/80 block mb-1">Ativos</span>
          <span className="text-2xl font-bold text-emerald-400">{byStatus.ACTIVE || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* By breed */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h3 className="text-lg font-bold text-white mb-4">População por Raça</h3>
          {breedPopData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">Nenhum animal</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={breedPopData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#71717a" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By status and sex */}
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Distribuição por Sexo</h3>
            <div className="flex items-center gap-8 h-40">
              <ResponsiveContainer width="50%" height="100%">
                <RechartsPie>
                  <Pie data={sexPopData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {sexPopData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {sexPopData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-zinc-400">{entry.name}</span>
                    <span className="font-bold text-zinc-200">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Distribuição por Status</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {statusPopData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between bg-zinc-800/30 p-3 rounded-xl border border-zinc-800/50">
                  <span className="text-zinc-400">{entry.name}</span>
                  <span className="font-bold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
