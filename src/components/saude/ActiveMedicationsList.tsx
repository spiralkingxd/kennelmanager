import { Pill } from 'lucide-react';
import { formatDate } from './utils';

interface Medication {
  id: string;
  name: string;
  animal_name: string;
  dose?: string;
  frequency?: string;
  endDate?: string;
}

interface ActiveMedicationsListProps {
  medications: Medication[];
}

export function ActiveMedicationsList({ medications }: ActiveMedicationsListProps) {
  if (!medications || medications.length === 0) return null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Pill size={18} className="text-purple-500" />
          Medicações Ativas
        </h2>
        <span className="text-xs text-zinc-500">{medications.length}</span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {medications.slice(0, 10).map((med) => (
          <div key={med.id} className="flex flex-col rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">{med.name}</span>
              <span className="text-xs text-zinc-400">{med.animal_name}</span>
            </div>
            <div className="flex gap-3 mt-1.5 text-xs text-zinc-500">
              {med.dose && <span>Dose: {med.dose}</span>}
              {med.frequency && <span>Freq: {med.frequency}</span>}
            </div>
            {med.endDate && (
              <div className="mt-1.5 pt-1.5 border-t border-zinc-800/50 flex justify-between">
                <span className="text-xs text-zinc-600">Término:</span>
                <span className="text-xs font-medium text-zinc-400">{formatDate(med.endDate)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}