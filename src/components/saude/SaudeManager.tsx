import { Search, Filter, Plus, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../shared/utils/apiFetch';
import { OverviewData, HealthRecordType } from './types';
import { SaudeHeader } from './SaudeHeader';
import { SaudeStatsCards } from './SaudeStatsCards';
import { UpcomingEventsList, UpcomingEvent } from './UpcomingEventsList';
import { AnimalsInTreatmentList } from './AnimalsInTreatmentList';
import { ActiveMedicationsList } from './ActiveMedicationsList';
import { NewHealthRecordModal } from './NewHealthRecordModal';
import { HEALTH_TYPE_OPTIONS } from './types';

export function SaudeManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Modal state ──────────────────────────────────────────────────────────
  const [showNewModal, setShowNewModal] = useState(false);
  const [animals, setAnimals] = useState<any[]>([]);
  const [modalForm, setModalForm] = useState<{
    type: HealthRecordType;
    animalId: string;
    date: string;
    detail: string;
  }>({ type: 'vaccine', animalId: '', date: new Date().toISOString().split('T')[0], detail: '' });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openNewModal = async () => {
    setShowNewModal(true);
    setModalForm({ type: 'vaccine', animalId: '', date: new Date().toISOString().split('T')[0], detail: '' });
    setModalError(null);
    if (animals.length === 0) {
      try {
        const json = await apiFetch('/animals?limit=500');
        if (json.success) setAnimals(json.data);
      } catch { /* animals stays empty */ }
    }
  };

  const handleCreateHealthRecord = async () => {
    setSaving(true);
    setModalError(null);
    try {
      const typeOpt = HEALTH_TYPE_OPTIONS.find(o => o.value === modalForm.type)!;

      const body: Record<string, any> = {
        animalId: modalForm.animalId,
        date: modalForm.date,
      };

      if (modalForm.type === 'weight') {
        body.weight = parseFloat(modalForm.detail);
        if (isNaN(body.weight) || body.weight <= 0) {
          setModalError('Informe um peso válido (em kg).');
          setSaving(false);
          return;
        }
      } else if (modalForm.type === 'medication') {
        body.name = modalForm.detail;
        body.startDate = modalForm.date;
        delete body.date;
      } else if (modalForm.type === 'exam') {
        body.type = modalForm.detail.toUpperCase().replace(/[^A-Z_]/g, '');
        if (!body.type) {
          setModalError('Informe o tipo de exame.');
          setSaving(false);
          return;
        }
      } else if (modalForm.type === 'consultation') {
        body.reason = modalForm.detail;
      } else if (modalForm.type === 'deworming') {
        body.product = modalForm.detail;
      } else if (modalForm.type === 'vaccine') {
        body.name = modalForm.detail;
      }

      if (!modalForm.animalId) {
        setModalError('Selecione um animal.');
        setSaving(false);
        return;
      }

      if (typeOpt.requiresDetail && !modalForm.detail.trim()) {
        setModalError(`Informe ${typeOpt.detailLabel.toLowerCase()}.`);
        setSaving(false);
        return;
      }

      const json = await apiFetch(`/health/${modalForm.animalId}/${typeOpt.endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (json.success) {
        setShowNewModal(false);
        fetchOverview();
      } else {
        setModalError(json.message || 'Erro ao criar registro');
      }
    } catch {
      setModalError('Erro de conexão ao servidor');
    } finally {
      setSaving(false);
    }
  };

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiFetch('/health/overview');
      if (json.success) setData(json.data);
      else throw new Error(json.message || 'Erro desconhecido');
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);

  // ─── Upcoming events (merge vaccines + deworming) ──────────────────────────
  const upcomingEvents: UpcomingEvent[] = [
    ...(data?.upcomingVaccines.map((v: any) => ({
      id: v.id,
      type: 'vaccine' as const,
      procedure: v.name,
      animalName: v.animal_name,
      animalBreed: v.animal_breed,
      expectedDate: v.next_due_date,
    })) ?? []),
    ...(data?.upcomingDeworming.map((d: any) => ({
      id: d.id,
      type: 'deworming' as const,
      procedure: d.product,
      animalName: d.animal_name,
      animalBreed: d.animal_breed,
      expectedDate: d.next_due_date,
    })) ?? []),
  ].sort((a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime());

  const filteredEvents = upcomingEvents.filter(
    (e) =>
      e.procedure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.animalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTreatments = (data?.animalsInTreatment ?? []).filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <span className="text-sm text-zinc-400">Carregando dados de saúde...</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            onClick={fetchOverview}
            className="h-9 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.statistics;

  const handleModalFormChange = (field: string, value: string) => {
    setModalForm(p => ({ ...p, [field]: value }));
  };

  return (
    <div className="space-y-6">

      <SaudeHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewRecord={openNewModal}
      />

      <SaudeStatsCards stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <UpcomingEventsList events={filteredEvents} />

        {/* Animals in Treatment / Active Medications */}
        <div className="xl:col-span-1 space-y-6">
          <AnimalsInTreatmentList animals={filteredTreatments} />
          <ActiveMedicationsList medications={data?.activeMedications ?? []} />
        </div>

      </div>

      <NewHealthRecordModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        form={modalForm}
        onFormChange={handleModalFormChange}
        animals={animals}
        saving={saving}
        error={modalError}
        onSubmit={handleCreateHealthRecord}
      />
    </div>
  );
}