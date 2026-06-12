import { Search, Plus, AlertTriangle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import type { Animal, HeatCycle, Mating, Gestation, FemaleReproData } from './types';
import { calculateReproductiveStatus, formatDate } from './utils';
import { ReproStatsCards } from './ReproStatsCards';
import { FemaleGrid } from './FemaleGrid';
import { ReproAgenda } from './ReproAgenda';
import { NovoEventoModal } from './NovoEventoModal';
import { RegistroReprodutivoModal } from './RegistroReprodutivoModal';
import { apiFetch } from '../../shared/utils/apiFetch';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function ReproducaoManager() {
  const [females, setFemales] = useState<FemaleReproData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedFemale, setSelectedFemale] = useState<Animal | null>(null);
  const [registrosAnimal, setRegistrosAnimal] = useState<Animal | null>(null);
  const [allAnimals, setAllAnimals] = useState<Animal[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const animalsJson = await apiFetch('/animals?limit=1000');

      if (!animalsJson.success) throw new Error(animalsJson.message || 'Erro ao buscar animais');

      const femaleAnimals = (animalsJson.data || []).filter((a: Animal) => a.sex === 'FEMALE');

      const reproDataPromises = femaleAnimals.map(async (animal: Animal): Promise<FemaleReproData> => {
        try {
          const healthJson = await apiFetch(`/health/${animal.id}`);

          const heatCycles: HeatCycle[] = healthJson.data?.heatCycles || [];
          const matings: Mating[] = healthJson.data?.matings || [];
          const gestations: Gestation[] = healthJson.data?.gestations || [];

          heatCycles.sort((a: HeatCycle, b: HeatCycle) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
          matings.sort((a: Mating, b: Mating) => new Date(b.date).getTime() - new Date(a.date).getTime());
          gestations.sort((a: Gestation, b: Gestation) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

          const reproStatus = calculateReproductiveStatus(heatCycles, matings, gestations);

          return {
            animal,
            heatCycles,
            matings,
            gestations,
            ...reproStatus,
          };
        } catch (err) {
          return {
            animal,
            heatCycles: [],
            matings: [],
            gestations: [],
            status: 'Sem Atividade',
            statusDays: 0,
            progress: 0,
            nextEvent: 'Próximo Cio',
            nextDate: null,
          };
        }
      });

      const reproData = await Promise.all(reproDataPromises);

      const statusPriority: Record<string, number> = {
        'Em Cio': 1,
        'Coberta': 2,
        'Gestante': 3,
        'Pós-Cio': 4,
        'Amamentando': 5,
        'Sem Atividade': 6,
      };

      reproData.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 99;
        const priorityB = statusPriority[b.status] || 99;
        return priorityA - priorityB;
      });

      setFemales(reproData);
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (eventModalOpen && allAnimals.length === 0) {
      apiFetch('/animals?limit=1000')
        .then(json => {
          if (json.success && json.data) {
            setAllAnimals(json.data);
          }
        })
        .catch(console.error);
    }
  }, [eventModalOpen, allAnimals.length]);

  const handleEventTypeSelect = (eventType: string) => {
    setSelectedEventType(eventType);
  };

  const handleFemaleSelect = (femaleId: string) => {
    const female = allAnimals.find(a => a.id === femaleId);
    if (female) {
      setSelectedFemale(female);
    }
  };

  const handleSaveEvent = async () => {
    if (!selectedFemale || !selectedEventType) return;

    try {
      if (selectedEventType === 'heat_cycle') {
        await apiFetch(`/health/${selectedFemale.id}/heat-cycles`, {
          method: 'POST',
          body: JSON.stringify({
            animalId: selectedFemale.id,
            startDate: new Date().toISOString().slice(0, 10),
          }),
        });
      }
      // Mating and gestation are handled directly by the modal with its own API calls.
      // This callback just refreshes data and closes the modal.

      fetchData();
      setEventModalOpen(false);
      setSelectedEventType(null);
      setSelectedFemale(null);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Erro ao registrar evento.' });
    }
  };

  const handleCloseModal = () => {
    setEventModalOpen(false);
    setSelectedEventType(null);
    setSelectedFemale(null);
  };

  const handleBackToType = () => {
    setSelectedEventType(null);
  };

  const filteredFemales = females.filter(f =>
    f.animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span className="text-sm text-zinc-400">Carregando dados reprodutivos...</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle size={40} className="text-red-500" />
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={fetchData}
            className="h-9 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ─── Statistics ────────────────────────────────────────────────────────────
  const stats = {
    total: females.length,
    inHeat: females.filter(f => f.status === 'Em Cio').length,
    mated: females.filter(f => f.status === 'Coberta').length,
    pregnant: females.filter(f => f.status === 'Gestante').length,
    nursing: females.filter(f => f.status === 'Amamentando').length,
    resting: females.filter(f => f.status === 'Sem Atividade').length,
  };

  // ─── Upcoming Events (Agenda Reprodutiva) ─────────────────────────────────
  const upcomingEvents: { date: string; title: string; type: string; animalName: string }[] = [];

  females.forEach(f => {
    const activeGestation = f.gestations.find(g => g.is_active && g.expected_birth_date);
    if (activeGestation) {
      upcomingEvents.push({
        date: formatDate(activeGestation.expected_birth_date),
        title: `Parto previsto: ${f.animal.name}`,
        type: 'parto',
        animalName: f.animal.name,
      });
    }

    if (f.status === 'Coberta' && f.matings[0]) {
      upcomingEvents.push({
        date: formatDate(f.matings[0].date),
        title: `Cobertura: ${f.animal.name}`,
        type: 'cobertura',
        animalName: f.animal.name,
      });
    }
  });

  upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">

      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative flex-1 group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar fêmea por nome ou raça..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900/50 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setEventModalOpen(true)} className="flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all">
            <Plus size={18} /> Novo Evento
          </button>
        </div>
      </div>

      <ReproStatsCards stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <FemaleGrid filteredFemales={filteredFemales} onRegistros={setRegistrosAnimal} />
        <ReproAgenda upcomingEvents={upcomingEvents} />
      </div>

      <NovoEventoModal
        isOpen={eventModalOpen}
        onClose={handleCloseModal}
        allAnimals={allAnimals}
        selectedEventType={selectedEventType}
        selectedFemale={selectedFemale}
        onEventTypeSelect={handleEventTypeSelect}
        onFemaleSelect={handleFemaleSelect}
        onSave={handleSaveEvent}
        onBack={handleBackToType}
      />

      {registrosAnimal && (
        <RegistroReprodutivoModal
          isOpen
          onClose={() => setRegistrosAnimal(null)}
          animal={registrosAnimal}
          onRefresh={fetchData}
        />
      )}

      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}
