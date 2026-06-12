import { pool } from '../../shared/config/db';
import { vaccineRepository } from './repositories/VaccineRepository';
import { dewormingRepository } from './repositories/DewormingRepository';
import { examsRepository } from './repositories/ExamsRepository';
import { consultationsRepository } from './repositories/ConsultationsRepository';
import { medicationsRepository } from './repositories/MedicationsRepository';
import { weightRepository } from './repositories/WeightRepository';
import { heatCyclesRepository } from './repositories/HeatCyclesRepository';
import { matingsRepository } from './repositories/MatingsRepository';
import { gestationsRepository } from './repositories/GestationsRepository';

export class HealthRepository {
  declare findVaccinesByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findVaccineById: (id: string, userId?: string) => Promise<any>;
  declare createVaccine: (data: any) => Promise<any>;
  declare updateVaccine: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteVaccine: (id: string, userId?: string) => Promise<any>;

  declare findDewormingByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findDewormingById: (id: string, userId?: string) => Promise<any>;
  declare createDeworming: (data: any) => Promise<any>;
  declare updateDeworming: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteDeworming: (id: string, userId?: string) => Promise<any>;

  declare findExamsByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findExamById: (id: string, userId?: string) => Promise<any>;
  declare createExam: (data: any) => Promise<any>;
  declare updateExam: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteExam: (id: string, userId?: string) => Promise<any>;

  declare findConsultationsByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findConsultationById: (id: string, userId?: string) => Promise<any>;
  declare createConsultation: (data: any) => Promise<any>;
  declare updateConsultation: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteConsultation: (id: string, userId?: string) => Promise<any>;

  declare findMedicationsByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findMedicationById: (id: string, userId?: string) => Promise<any>;
  declare createMedication: (data: any) => Promise<any>;
  declare updateMedication: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteMedication: (id: string, userId?: string) => Promise<any>;

  declare findWeightHistory: (animalId: string, userId?: string) => Promise<any[]>;
  declare findWeightById: (id: string, userId?: string) => Promise<any>;
  declare createWeight: (data: any) => Promise<any>;
  declare deleteWeight: (id: string, userId?: string) => Promise<any>;

  declare findHeatCyclesByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findHeatCycleById: (id: string, userId?: string) => Promise<any>;
  declare createHeatCycle: (data: any) => Promise<any>;
  declare updateHeatCycle: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteHeatCycle: (id: string, userId?: string) => Promise<any>;

  declare findMatingsByFemale: (femaleId: string, userId?: string) => Promise<any[]>;
  declare findMatingById: (id: string, userId?: string) => Promise<any>;
  declare createMating: (data: any) => Promise<any>;
  declare updateMating: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteMating: (id: string, userId?: string) => Promise<any>;

  declare findGestationsByAnimal: (animalId: string, userId?: string) => Promise<any[]>;
  declare findActiveGestation: (animalId: string, userId?: string) => Promise<any>;
  declare findGestationById: (id: string, userId?: string) => Promise<any>;
  declare createGestation: (data: any) => Promise<any>;
  declare updateGestation: (id: string, data: any, userId?: string) => Promise<any>;
  declare deleteGestation: (id: string, userId?: string) => Promise<any>;

  constructor() {
    Object.assign(this,
      vaccineRepository,
      dewormingRepository,
      examsRepository,
      consultationsRepository,
      medicationsRepository,
      weightRepository,
      heatCyclesRepository,
      matingsRepository,
      gestationsRepository,
    );
  }

  public async findLittersByMother(motherId: string, userId?: string) {
    const res = await pool.query(
      `SELECT l.*,
        father.name AS father_name
       FROM litters l
       LEFT JOIN animals father ON father.id = l.father_id
       WHERE l.mother_id = $1 AND ($2::uuid IS NULL OR l.created_by = $2)
       ORDER BY l.created_at DESC`,
      [motherId, userId ?? null]
    );
    return res.rows;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // GLOBAL OVERVIEW (cross-animal queries for the health dashboard)
  // ════════════════════════════════════════════════════════════════════════════
  public async findUpcomingVaccines(days: number = 30, userId?: string) {
    let sql = `SELECT v.*, a.name AS animal_name, a.breed AS animal_breed
       FROM vaccines v
       JOIN animals a ON a.id = v.animal_id
       WHERE v.next_due_date IS NOT NULL
         AND v.next_due_date >= CURRENT_DATE
         AND v.next_due_date <= CURRENT_DATE + $1::integer`;
    const params: any[] = [days, userId ?? null];
    sql += ' AND ($2::uuid IS NULL OR v.created_by = $2)';
    sql += ' ORDER BY v.next_due_date ASC';
    const res = await pool.query(sql, params);
    return res.rows;
  }

  public async findUpcomingDeworming(days: number = 30, userId?: string) {
    let sql = `SELECT d.*, a.name AS animal_name, a.breed AS animal_breed
       FROM deworming d
       JOIN animals a ON a.id = d.animal_id
       WHERE d.next_due_date IS NOT NULL
         AND d.next_due_date >= CURRENT_DATE
         AND d.next_due_date <= CURRENT_DATE + $1::integer`;
    const params: any[] = [days, userId ?? null];
    sql += ' AND ($2::uuid IS NULL OR d.created_by = $2)';
    sql += ' ORDER BY d.next_due_date ASC';
    const res = await pool.query(sql, params);
    return res.rows;
  }

  public async findActiveMedications(userId?: string) {
    let sql = `SELECT m.*, a.name AS animal_name, a.breed AS animal_breed
       FROM medications m
       JOIN animals a ON a.id = m.animal_id
       WHERE m.status = 'ACTIVE'
         AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)`;
    const params: any[] = [userId ?? null];
    sql += ' AND ($1::uuid IS NULL OR m.created_by = $1)';
    sql += ' ORDER BY m.start_date DESC';
    const res = await pool.query(sql, params);
    return res.rows;
  }

  public async findAnimalsInTreatment(userId?: string) {
    let sql = `SELECT DISTINCT a.id, a.name, a.breed, a.photo_url
       FROM animals a
       JOIN medications m ON m.animal_id = a.id
       WHERE m.status = 'ACTIVE'
         AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)`;
    const params: any[] = [userId ?? null];
    sql += ' AND ($1::uuid IS NULL OR a.created_by = $1)';
    sql += ' ORDER BY a.name';
    const res = await pool.query(sql, params);
    return res.rows;
  }

  public async countAnimals(userId?: string) {
    const sql = "SELECT COUNT(*)::integer AS total FROM animals WHERE status = 'ACTIVE' AND ($1::uuid IS NULL OR created_by = $1)";
    const params: any[] = [userId ?? null];
    const res = await pool.query(sql, params);
    return res.rows[0].total;
  }

  public async countCriticalAlerts(userId?: string) {
    let sql = `SELECT COUNT(*)::integer AS total FROM animals a WHERE EXISTS (
         SELECT 1 FROM medications m
         WHERE m.animal_id = a.id AND m.status = 'ACTIVE'
           AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
       )`;
    const params: any[] = [userId ?? null];
    sql += ' AND ($1::uuid IS NULL OR a.created_by = $1)';
    const res = await pool.query(sql, params);
    return res.rows[0].total;
  }

  public async countPendingTreatments(userId?: string) {
    let sql = `SELECT COUNT(*)::integer AS total
       FROM medications
       WHERE status = 'ACTIVE'
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)`;
    const params: any[] = [userId ?? null];
    sql += ' AND ($1::uuid IS NULL OR created_by = $1)';
    const res = await pool.query(sql, params);
    return res.rows[0].total;
  }
}
