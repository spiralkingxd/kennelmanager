export type HealthRecordType = 'vaccine' | 'deworming' | 'exam' | 'consultation' | 'medication' | 'weight';

export interface HealthTypeOption {
  value: HealthRecordType;
  label: string;
  endpoint: string;
  detailLabel: string;
  detailPlaceholder: string;
  requiresDetail: boolean;
  detailField: string;
}

export interface OverviewData {
  upcomingVaccines: any[];
  upcomingDeworming: any[];
  activeMedications: any[];
  animalsInTreatment: { id: string; name: string; breed: string; photo_url: string | null }[];
  statistics: {
    totalAnimals: number;
    criticalAlerts: number;
    pendingTreatments: number;
    healthyPercentage: number;
  };
}

export const HEALTH_TYPE_OPTIONS: HealthTypeOption[] = [
  { value: 'vaccine', label: 'Vacina', endpoint: 'vaccines', detailLabel: 'Nome da Vacina', detailPlaceholder: 'Ex: V10, Antirrábica...', requiresDetail: true, detailField: 'name' },
  { value: 'deworming', label: 'Vermífugo', endpoint: 'deworming', detailLabel: 'Produto', detailPlaceholder: 'Ex: Drontal, Milbemax...', requiresDetail: true, detailField: 'product' },
  { value: 'exam', label: 'Exame', endpoint: 'exams', detailLabel: 'Tipo de Exame', detailPlaceholder: 'Ex: Sangue, Raio-X...', requiresDetail: true, detailField: 'type' },
  { value: 'consultation', label: 'Consulta', endpoint: 'consultations', detailLabel: 'Motivo', detailPlaceholder: 'Ex: Check-up, Febre...', requiresDetail: true, detailField: 'reason' },
  { value: 'medication', label: 'Medicação', endpoint: 'medications', detailLabel: 'Nome do Medicamento', detailPlaceholder: 'Ex: Antibiótico...', requiresDetail: true, detailField: 'name' },
  { value: 'weight', label: 'Peso', endpoint: 'weight', detailLabel: 'Peso (kg)', detailPlaceholder: 'Ex: 25.5', requiresDetail: true, detailField: 'weight' },
];