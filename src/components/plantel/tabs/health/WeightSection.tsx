import { Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeightSectionProps {
  weightHistory: any[];
  onAdd: () => void;
}

export function WeightSection({ weightHistory, onAdd }: WeightSectionProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">Evolução do Peso e Desenvolvimento</h3>
        <button onClick={onAdd} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Registrar Peso
        </button>
      </div>
      {weightHistory.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhum registro de peso.</p>
      ) : (
      <div className="h-[400px] w-full rounded-xl bg-zinc-900/40 p-4 border border-zinc-800">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightHistory} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10}
              tickFormatter={(val) => val ? new Date(val).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }) : ''} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(val) => `${val}kg`} />
            <Tooltip 
              labelFormatter={(val) => val ? new Date(val).toLocaleDateString('pt-BR') : ''}
              formatter={(value: any) => [`${value} kg`, 'Peso']}
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
              itemStyle={{ color: '#0f766e' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" name="Peso (kg)" dataKey="weight" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: '#0f766e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
