import { Info, DollarSign, Activity, FileText, Heart, ChevronLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PlantelGeneralTab } from './tabs/PlantelGeneralTab';
import { PlantelFinanceTab } from './tabs/PlantelFinanceTab';
import { PlantelHealthTab } from './tabs/PlantelHealthTab';
import { PlantelReproductionTab } from './tabs/PlantelReproductionTab';
import { PlantelDocsTab } from './tabs/PlantelDocsTab';
import { AnimalEditModal } from './modals/AnimalEditModal';
import { apiFetch } from '../../shared/utils/apiFetch';

interface DogProfileProps {
  dogId: string;
  onBack: () => void;
  onDeleteRequest?: (name: string) => void;
}

export function DogProfile({ dogId, onBack, onDeleteRequest }: DogProfileProps) {
  const [activeTab, setActiveTab] = useState('gerais');
  const [dog, setDog] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchDog = () => {
    apiFetch(`/animals/${dogId}`)
      .then(res => {
        if (res.success) {
          setDog(res.data);
        }
      })
      .catch(console.error);
  };

  useEffect(() => { fetchDog(); }, [dogId, refreshKey]);

  const handleDogUpdate = () => setRefreshKey((k) => k + 1);

  if (!dog) {
    return (
      <div className="p-8 text-center text-zinc-500 flex items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        Carregando...
      </div>
    );
  }

  const statusInfo: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'ATIVO', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-800/50' },
    INACTIVE: { label: 'INATIVO', color: 'bg-amber-500/10 text-amber-500 border border-amber-800/50' },
    DECEASED: { label: 'FALECIDO', color: 'bg-red-500/10 text-red-400 border border-red-800/50' },
    SOLD: { label: 'VENDIDO', color: 'bg-blue-500/10 text-blue-400 border border-blue-800/50' },
  };
  const st = statusInfo[dog.status] || statusInfo.ACTIVE;

  const computeAge = (birthDate: string | null): string => {
    if (!birthDate) return 'N/I';
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (months < 0) return `${years - 1}a ${12 + months}m`;
    return `${years}a ${months}m`;
  };

  const sexLabel = dog.sex === 'MALE' ? 'Macho' : 'Fêmea';

  const tabs = [
    { id: 'gerais', label: 'Dados Gerais', icon: Info },
    { id: 'saude', label: 'Saúde', icon: Activity },
    { id: 'reproducao', label: 'Reprodução', icon: Heart },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'documentos', label: 'Documentos', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header (Back button and Dog Basic Info) */}
      <div className="flex items-start gap-4">
        <button 
          onClick={onBack}
          aria-label="Voltar para listagem de animais"
          className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-1 flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-zinc-800 bg-zinc-800 text-3xl font-bold text-zinc-500 shadow-inner">
              {dog.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">{dog.name}</h1>
                <span className={`rounded px-2.5 py-0.5 text-xs font-bold tracking-widest ${st.color}`}>
                  {st.label}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-zinc-400">
                {dog.breed} • {sexLabel} • {computeAge(dog.birth_date)}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => onDeleteRequest?.(dog.name)}
              aria-label={`Excluir ${dog?.name || 'animal'}`}
              className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
            >
              <Trash2 size={16} className="mr-2 inline" />
              Excluir
            </button>
            <button
              onClick={() => setEditModalOpen(true)}
              aria-label={`Editar ficha de ${dog?.name || 'animal'}`}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Editar Ficha
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-zinc-800 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'border-brand-500 text-brand-500 bg-zinc-800/30' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 min-h-[500px]">
          {activeTab === 'gerais' && <PlantelGeneralTab dog={dog} onDogUpdate={handleDogUpdate} />}
          {activeTab === 'saude' && <PlantelHealthTab dog={dog} />}
          {activeTab === 'reproducao' && <PlantelReproductionTab dog={dog} />}
          {activeTab === 'financeiro' && <PlantelFinanceTab dog={dog} />}
          {activeTab === 'documentos' && <PlantelDocsTab dog={dog} />}
        </div>
      </div>

      <AnimalEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaved={handleDogUpdate}
        dog={dog}
      />
    </div>
  );
}
