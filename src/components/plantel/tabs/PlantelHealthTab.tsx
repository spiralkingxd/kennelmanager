import { Syringe, Pill, FileText, Stethoscope, HeartPulse, Scale, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { VaccineModal } from '../modals/VaccineModal';
import { DewormingModal } from '../modals/DewormingModal';
import { ExamModal } from '../modals/ExamModal';
import { ConsultationModal } from '../modals/ConsultationModal';
import { MedicationModal } from '../modals/MedicationModal';
import { WeightModal } from '../modals/WeightModal';
import { ConfirmDelete } from '../modals/ConfirmDelete';
import { VaccinesSection } from './health/VaccinesSection';
import { DewormingSection } from './health/DewormingSection';
import { ExamsSection } from './health/ExamsSection';
import { ConsultationsSection } from './health/ConsultationsSection';
import { MedicationsSection } from './health/MedicationsSection';
import { WeightSection } from './health/WeightSection';
import { apiFetch } from '../../../shared/utils/apiFetch';

export function PlantelHealthTab({ dog }: { dog: any }) {
  const [activeSubTab, setActiveSubTab] = useState('vacinas');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vaccineModalOpen, setVaccineModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<any>(null);
  const [dewormingModalOpen, setDewormingModalOpen] = useState(false);
  const [editingDeworming, setEditingDeworming] = useState<any>(null);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<any>(null);
  const [medicationModalOpen, setMedicationModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHealth = () => {
    setLoading(true);
    apiFetch(`/health/${dog.id}`)
      .then(res => {
        if (res.success) {
          setData(res.data);
          setError(null);
        } else {
          setError('Erro ao carregar dados');
        }
      })
      .catch(() => setError('Erro de conexão'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHealth(); }, [dog.id]);

  const subTabs = [
    { id: 'vacinas', label: 'Vacinação', icon: Syringe },
    { id: 'vermifugo', label: 'Vermifugação', icon: Pill },
    { id: 'exames', label: 'Exames e Laudos', icon: FileText },
    { id: 'consultas', label: 'Consultas', icon: Stethoscope },
    { id: 'medicamentos', label: 'Medicamentos Ativos', icon: HeartPulse },
    { id: 'peso', label: 'Evolução de Peso', icon: Scale },
  ];

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-zinc-500">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />
      Carregando dados de saúde...
    </div>
  );

  if (error) return (
    <div className="flex flex-col h-64 items-center justify-center text-zinc-500 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p>{error}</p>
      <button onClick={fetchHealth} className="text-sm text-brand-500 hover:underline">Tentar novamente</button>
    </div>
  );

  if (!data) return null;

  const vaccines = data.vaccines || [];
  const deworming = data.deworming || [];
  const exams = data.exams || [];
  const consultations = data.consultations || [];
  const medications = data.medications || [];
  const weightHistory = data.weightHistory || [];

  const isPastDue = (date: string | null) => date && new Date(date) < new Date();
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const json = await apiFetch(`/health/${deleteTarget.type}/${deleteTarget.id}`, { method: 'DELETE' });
      if (json.success) { fetchHealth(); setDeleteTarget(null); }
    } catch {} finally { setDeleting(false); }
  };

  return (
    <>
     <div className="flex flex-col h-full gap-6">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
          {subTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' 
                  : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent'
              }`}
            >
              <tab.icon size={16} className={activeSubTab === tab.id ? 'text-brand-500' : ''} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-zinc-900/20 rounded-xl border border-zinc-800">
          {activeSubTab === 'vacinas' && (
            <VaccinesSection
              vaccines={vaccines}
              isPastDue={isPastDue}
              formatDate={formatDate}
              onAdd={() => { setEditingVaccine(null); setVaccineModalOpen(true); }}
              onDelete={(target) => setDeleteTarget(target)}
            />
          )}

          {activeSubTab === 'vermifugo' && (
            <DewormingSection
              deworming={deworming}
              isPastDue={isPastDue}
              formatDate={formatDate}
              onEdit={(item) => { setEditingDeworming(item); setDewormingModalOpen(true); }}
              onAdd={() => { setEditingDeworming(null); setDewormingModalOpen(true); }}
              onDelete={(target) => setDeleteTarget(target)}
            />
          )}

          {activeSubTab === 'exames' && (
            <ExamsSection
              exams={exams}
              formatDate={formatDate}
              onAdd={() => { setEditingExam(null); setExamModalOpen(true); }}
              onDelete={(target) => setDeleteTarget(target)}
            />
          )}

          {activeSubTab === 'consultas' && (
            <ConsultationsSection
              consultations={consultations}
              formatDate={formatDate}
              onAdd={() => { setEditingConsultation(null); setConsultationModalOpen(true); }}
            />
          )}

          {activeSubTab === 'medicamentos' && (
            <MedicationsSection
              medications={medications}
              formatDate={formatDate}
              onAdd={() => { setEditingMedication(null); setMedicationModalOpen(true); }}
              onDelete={(target) => setDeleteTarget(target)}
            />
          )}

          {activeSubTab === 'peso' && (
            <WeightSection
              weightHistory={weightHistory}
              onAdd={() => setWeightModalOpen(true)}
            />
          )}
        </div>
     </div>
      <VaccineModal isOpen={vaccineModalOpen} onClose={() => setVaccineModalOpen(false)}
        onSaved={fetchHealth} animalId={dog.id} vaccine={editingVaccine} />
      <DewormingModal isOpen={dewormingModalOpen} onClose={() => setDewormingModalOpen(false)}
        onSaved={fetchHealth} animalId={dog.id} deworming={editingDeworming} />
      <ExamModal isOpen={examModalOpen} onClose={() => setExamModalOpen(false)}
        onSaved={fetchHealth} animalId={dog.id} exam={editingExam} />
      <ConsultationModal isOpen={consultationModalOpen} onClose={() => setConsultationModalOpen(false)}
        onSaved={fetchHealth} animalId={dog.id} consultation={editingConsultation} />
      <MedicationModal isOpen={medicationModalOpen} onClose={() => setMedicationModalOpen(false)}
        onSaved={fetchHealth} animalId={dog.id} medication={editingMedication} />
      <WeightModal isOpen={weightModalOpen} onClose={() => setWeightModalOpen(false)}
        onSaved={fetchHealth} animalId={dog.id} />
      <ConfirmDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        loading={deleting} onConfirm={handleDelete}
        message="Tem certeza que deseja excluir este registro de saúde?" />
    </>
  );
}
