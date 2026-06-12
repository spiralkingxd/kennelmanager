import { pool } from '../../shared/config/db';
import { HealthRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';
import type { PoolClient } from 'pg';

export class HealthService {
  private repo: HealthRepository;
  constructor() { this.repo = new HealthRepository(); }

  // ─── Grouped endpoint ──────────────────────────────────────────────────────
  public async getAnimalHealth(animalId: string, userId?: string) {
    const [vaccines, deworming, exams, consultations, medications, weightHistory,
      heatCycles, matings, gestations, litters] = await Promise.all([
      this.repo.findVaccinesByAnimal(animalId, userId),
      this.repo.findDewormingByAnimal(animalId, userId),
      this.repo.findExamsByAnimal(animalId, userId),
      this.repo.findConsultationsByAnimal(animalId, userId),
      this.repo.findMedicationsByAnimal(animalId, userId),
      this.repo.findWeightHistory(animalId, userId),
      this.repo.findHeatCyclesByAnimal(animalId, userId),
      this.repo.findMatingsByFemale(animalId, userId),
      this.repo.findGestationsByAnimal(animalId, userId),
      this.repo.findLittersByMother(animalId, userId),
    ]);

    return { vaccines, deworming, exams, consultations, medications, weightHistory,
      heatCycles, matings, gestations, litters };
  }

  // ─── Vaccines ──────────────────────────────────────────────────────────────
  public async getVaccines(animalId: string, userId?: string) { return this.repo.findVaccinesByAnimal(animalId, userId); }
  public async getVaccine(id: string, userId?: string) {
    const r = await this.repo.findVaccineById(id, userId);
    if (!r) throw new AppError('Vacina não encontrada', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createVaccine(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    return this.repo.createVaccine(data);
  }
  public async updateVaccine(id: string, data: any, userId?: string) {
    await this.getVaccine(id, userId);
    return this.repo.updateVaccine(id, data, userId);
  }
  public async deleteVaccine(id: string, userId?: string) {
    await this.getVaccine(id, userId);
    return this.repo.deleteVaccine(id, userId);
  }

  // ─── Deworming ─────────────────────────────────────────────────────────────
  public async getDeworming(animalId: string, userId?: string) { return this.repo.findDewormingByAnimal(animalId, userId); }
  public async getDewormingById(id: string, userId?: string) {
    const r = await this.repo.findDewormingById(id, userId);
    if (!r) throw new AppError('Vermífugo não encontrado', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createDeworming(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    return this.repo.createDeworming(data);
  }
  public async updateDeworming(id: string, data: any, userId?: string) {
    await this.getDewormingById(id, userId);
    return this.repo.updateDeworming(id, data, userId);
  }
  public async deleteDeworming(id: string, userId?: string) {
    await this.getDewormingById(id, userId);
    return this.repo.deleteDeworming(id, userId);
  }

  // ─── Exams ─────────────────────────────────────────────────────────────────
  public async getExams(animalId: string, userId?: string) { return this.repo.findExamsByAnimal(animalId, userId); }
  public async getExam(id: string, userId?: string) {
    const r = await this.repo.findExamById(id, userId);
    if (!r) throw new AppError('Exame não encontrado', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createExam(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    return this.repo.createExam(data);
  }
  public async updateExam(id: string, data: any, userId?: string) {
    await this.getExam(id, userId);
    return this.repo.updateExam(id, data, userId);
  }
  public async deleteExam(id: string, userId?: string) {
    await this.getExam(id, userId);
    return this.repo.deleteExam(id, userId);
  }

  // ─── Consultations ─────────────────────────────────────────────────────────
  public async getConsultations(animalId: string, userId?: string) { return this.repo.findConsultationsByAnimal(animalId, userId); }
  public async getConsultation(id: string, userId?: string) {
    const r = await this.repo.findConsultationById(id, userId);
    if (!r) throw new AppError('Consulta não encontrada', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createConsultation(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    return this.repo.createConsultation(data);
  }
  public async updateConsultation(id: string, data: any, userId?: string) {
    await this.getConsultation(id, userId);
    return this.repo.updateConsultation(id, data, userId);
  }
  public async deleteConsultation(id: string, userId?: string) {
    await this.getConsultation(id, userId);
    return this.repo.deleteConsultation(id, userId);
  }

  // ─── Medications ───────────────────────────────────────────────────────────
  public async getMedications(animalId: string, userId?: string) { return this.repo.findMedicationsByAnimal(animalId, userId); }
  public async getMedication(id: string, userId?: string) {
    const r = await this.repo.findMedicationById(id, userId);
    if (!r) throw new AppError('Medicação não encontrada', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createMedication(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    return this.repo.createMedication(data);
  }
  public async updateMedication(id: string, data: any, userId?: string) {
    await this.getMedication(id, userId);
    return this.repo.updateMedication(id, data, userId);
  }
  public async deleteMedication(id: string, userId?: string) {
    await this.getMedication(id, userId);
    return this.repo.deleteMedication(id, userId);
  }

  // ─── Weight History ────────────────────────────────────────────────────────
  public async getWeightHistory(animalId: string, userId?: string) { return this.repo.findWeightHistory(animalId, userId); }
  public async createWeight(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    return this.repo.createWeight(data);
  }
  public async deleteWeight(id: string, userId?: string) {
    const r = await this.repo.findWeightById(id, userId);
    if (!r) throw new AppError('Registro de peso não encontrado', 404, true, 'NOT_FOUND');
    return this.repo.deleteWeight(id, userId);
  }

  // ─── State blocking validations ─────────────────────────────────────────────
  private async ensureNoActiveGestation(animalId: string, userId?: string, client?: PoolClient) {
    const query = 'SELECT id FROM gestations WHERE animal_id = $1 AND is_active = TRUE AND ($2::uuid IS NULL OR created_by = $2) ORDER BY start_date DESC LIMIT 1' + (client ? ' FOR UPDATE' : '');
    const res = client
      ? await client.query(query, [animalId, userId ?? null])
      : await pool.query(query, [animalId, userId ?? null]);
    if (res.rows.length > 0) {
      throw new AppError('Animal possui gestação ativa. Finalize a gestação atual antes de registrar um novo evento.', 400, true);
    }
  }

  private async verifyAnimalOwnership(animalId: string, userId?: string): Promise<void> {
    if (!userId) return;
    const res = await pool.query('SELECT id FROM animals WHERE id = $1 AND created_by = $2', [animalId, userId]);
    if (!res.rows.length) throw new AppError('Animal não encontrado ou não pertence ao usuário.', 404, true, 'NOT_FOUND');
  }

  // ─── Heat Cycles ───────────────────────────────────────────────────────────
  public async getHeatCycles(animalId: string, userId?: string) { return this.repo.findHeatCyclesByAnimal(animalId, userId); }
  public async getHeatCycle(id: string, userId?: string) {
    const r = await this.repo.findHeatCycleById(id, userId);
    if (!r) throw new AppError('Ciclo de cio não encontrado', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createHeatCycle(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    const animal = await pool.query('SELECT sex FROM animals WHERE id = $1', [data.animalId]);
    if (animal.rows.length === 0 || animal.rows[0].sex !== 'FEMALE') {
      throw new AppError('Apenas fêmeas podem ter ciclo de cio', 400, true);
    }
    await this.ensureNoActiveGestation(data.animalId);
    const result = await this.repo.createHeatCycle(data);
    this.createReproEvent(data.animalId, data.startDate, 'Cio registrado', data.createdBy).catch(() => {});
    return result;
  }
  public async updateHeatCycle(id: string, data: any, userId?: string) {
    await this.getHeatCycle(id, userId);
    return this.repo.updateHeatCycle(id, data, userId);
  }
  public async deleteHeatCycle(id: string, userId?: string) {
    await this.getHeatCycle(id, userId);
    return this.repo.deleteHeatCycle(id, userId);
  }

  // ─── Matings ───────────────────────────────────────────────────────────────
  public async getMatings(femaleId: string, userId?: string) { return this.repo.findMatingsByFemale(femaleId, userId); }
  public async getMating(id: string, userId?: string) {
    const r = await this.repo.findMatingById(id, userId);
    if (!r) throw new AppError('Cobertura não encontrada', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createMating(data: any) {
    await this.verifyAnimalOwnership(data.femaleId, data.createdBy);
    await this.verifyAnimalOwnership(data.maleId, data.createdBy);
    const female = await pool.query('SELECT sex FROM animals WHERE id = $1', [data.femaleId]);
    if (female.rows.length === 0 || female.rows[0].sex !== 'FEMALE') {
      throw new AppError('Apenas fêmeas podem ser registradas como matriz em coberturas', 400, true);
    }
    const male = await pool.query('SELECT sex FROM animals WHERE id = $1', [data.maleId]);
    if (male.rows.length === 0 || male.rows[0].sex !== 'MALE') {
      throw new AppError('Apenas machos podem ser registrados como reprodutores em coberturas', 400, true);
    }
    await this.ensureNoActiveGestation(data.femaleId);
    const result = await this.repo.createMating(data);
    this.createReproEvent(data.femaleId, data.date, 'Cobertura registrada', data.createdBy).catch(() => {});
    return result;
  }
  public async updateMating(id: string, data: any, userId?: string) {
    await this.getMating(id, userId);
    return this.repo.updateMating(id, data, userId);
  }
  public async deleteMating(id: string, userId?: string) {
    await this.getMating(id, userId);
    return this.repo.deleteMating(id, userId);
  }

  // ─── Gestations ────────────────────────────────────────────────────────────
  public async getGestations(animalId: string, userId?: string) { return this.repo.findGestationsByAnimal(animalId, userId); }
  public async getActiveGestation(animalId: string, userId?: string) { return this.repo.findActiveGestation(animalId, userId); }
  public async getGestation(id: string, userId?: string) {
    const r = await this.repo.findGestationById(id, userId);
    if (!r) throw new AppError('Gestação não encontrada', 404, true, 'NOT_FOUND');
    return r;
  }
  public async createGestation(data: any) {
    await this.verifyAnimalOwnership(data.animalId, data.createdBy);
    const animal = await pool.query('SELECT sex FROM animals WHERE id = $1', [data.animalId]);
    if (animal.rows.length === 0 || animal.rows[0].sex !== 'FEMALE') {
      throw new AppError('Apenas fêmeas podem ter gestação', 400, true);
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await this.ensureNoActiveGestation(data.animalId, data.createdBy, client);
      const res = await client.query(
        `INSERT INTO gestations (animal_id, mating_id, start_date, expected_birth_date, actual_birth_date,
          estimated_puppies, progress_week, is_active, litter_id, notes, created_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
         RETURNING *`,
        [data.animalId, data.matingId, data.startDate, data.expectedBirthDate,
         data.actualBirthDate, data.estimatedPuppies, data.progressWeek || 0,
         data.isActive !== false, data.litterId, data.notes, data.createdBy]
      );
      await client.query('COMMIT');
      const result = res.rows[0];
      if (data.expectedBirthDate) {
        this.createReproEvent(data.animalId, data.expectedBirthDate, 'Parto previsto', data.createdBy).catch(() => {});
      }
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  public async updateGestation(id: string, data: any, userId?: string) {
    await this.getGestation(id, userId);
    const result = await this.repo.updateGestation(id, data, userId);
    if (data.expectedBirthDate) {
      this.createReproEvent(result.animal_id, data.expectedBirthDate, 'Parto previsto', result.created_by).catch(() => {});
    }
    return result;
  }
  public async deleteGestation(id: string, userId?: string) {
    await this.getGestation(id, userId);
    return this.repo.deleteGestation(id, userId);
  }

  // ─── Global Overview ──────────────────────────────────────────────────────────
  public async getOverview(userId?: string) {
    const [upcomingVaccines, upcomingDeworming, activeMedications, animalsInTreatment,
      totalAnimals, criticalAlerts, pendingTreatments] = await Promise.all([
      this.repo.findUpcomingVaccines(30, userId),
      this.repo.findUpcomingDeworming(30, userId),
      this.repo.findActiveMedications(userId),
      this.repo.findAnimalsInTreatment(userId),
      this.repo.countAnimals(userId),
      this.repo.countCriticalAlerts(userId),
      this.repo.countPendingTreatments(userId),
    ]);

    return {
      upcomingVaccines,
      upcomingDeworming,
      activeMedications,
      animalsInTreatment,
      statistics: {
        totalAnimals,
        criticalAlerts,
        pendingTreatments,
        healthyPercentage: totalAnimals > 0
          ? Math.round(((totalAnimals - animalsInTreatment.length) / totalAnimals) * 100)
          : 100,
      },
    };
  }

  // ─── Calendar sync (fire-and-forget) ────────────────────────────────────
  private async createReproEvent(animalId: string, date: string, title: string, createdBy?: string) {
    if (!date || !animalId) return;
    await pool.query(
      `INSERT INTO calendar_events (title, date, category, animal_id, is_automatic, created_by, updated_at)
       VALUES ($1, $2, 'REPRODUCTION', $3, true, $4, CURRENT_TIMESTAMP)`,
      [title, date, animalId, createdBy]
    );
  }
}
