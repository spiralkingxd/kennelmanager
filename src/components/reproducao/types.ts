// ─── Types ───────────────────────────────────────────────────────────────────

export interface Animal {
  id: string;
  name: string;
  breed: string;
  sex: string;
  photo_url: string | null;
  status: string;
  birth_date: string | null;
}

export interface HeatCycle {
  id: string;
  animal_id: string;
  start_date: string;
  end_date: string | null;
  intensity: string | null;
  was_mated: boolean;
  notes: string | null;
}

export interface Mating {
  id: string;
  female_id: string;
  male_id: string;
  male_name: string | null;
  type: string;
  date: string;
  result: string | null;
  litter_id: string | null;
  notes: string | null;
}

export interface Gestation {
  id: string;
  animal_id: string;
  mating_id: string | null;
  start_date: string;
  expected_birth_date: string | null;
  actual_birth_date: string | null;
  estimated_puppies: number | null;
  progress_week: number;
  is_active: boolean;
  notes: string | null;
}

export interface FemaleReproData {
  animal: Animal;
  heatCycles: HeatCycle[];
  matings: Mating[];
  gestations: Gestation[];
  status: string;
  statusDays: number;
  progress: number;
  nextEvent: string;
  nextDate: string | null;
}
