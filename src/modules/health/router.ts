import { Router } from 'express';
import { HealthController } from './controller';
import { requireRole } from '../../shared/middlewares/auth';

export const healthRouter = Router();
const ctrl = new HealthController();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Saúde, reprodução e peso dos animais
 */

// ─── Overview (global health dashboard) — MUST be before `/:animalId` ──────
healthRouter.get('/overview', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getOverview);

// ─── Grouped endpoint (returns all health + reproduction data) ───────────────
healthRouter.get('/:animalId', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getAnimalHealth);

// ═══════════════════════════════════════════════════════════════════════════════
// VACCINES
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/vaccines', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getVaccines);
healthRouter.post('/:animalId/vaccines', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createVaccine);
healthRouter.put('/vaccines/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateVaccine);
healthRouter.delete('/vaccines/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteVaccine);

// ═══════════════════════════════════════════════════════════════════════════════
// DEWORMING
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/deworming', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getDeworming);
healthRouter.post('/:animalId/deworming', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createDeworming);
healthRouter.put('/deworming/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateDeworming);
healthRouter.delete('/deworming/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteDeworming);

// ═══════════════════════════════════════════════════════════════════════════════
// EXAMS
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/exams', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getExams);
healthRouter.post('/:animalId/exams', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createExam);
healthRouter.put('/exams/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateExam);
healthRouter.delete('/exams/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteExam);

// ═══════════════════════════════════════════════════════════════════════════════
// CONSULTATIONS
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/consultations', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getConsultations);
healthRouter.post('/:animalId/consultations', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createConsultation);
healthRouter.put('/consultations/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateConsultation);
healthRouter.delete('/consultations/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteConsultation);

// ═══════════════════════════════════════════════════════════════════════════════
// MEDICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/medications', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getMedications);
healthRouter.post('/:animalId/medications', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createMedication);
healthRouter.put('/medications/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateMedication);
healthRouter.delete('/medications/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteMedication);

// ═══════════════════════════════════════════════════════════════════════════════
// WEIGHT HISTORY
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/weight', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getWeightHistory);
healthRouter.post('/:animalId/weight', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createWeight);
healthRouter.delete('/weight/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteWeight);

// ═══════════════════════════════════════════════════════════════════════════════
// HEAT CYCLES
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/heat-cycles', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getHeatCycles);
healthRouter.post('/:animalId/heat-cycles', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createHeatCycle);
healthRouter.put('/heat-cycles/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateHeatCycle);
healthRouter.delete('/heat-cycles/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteHeatCycle);

// ═══════════════════════════════════════════════════════════════════════════════
// MATINGS
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/matings', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getMatings);
healthRouter.post('/:animalId/matings', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createMating);
healthRouter.put('/matings/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateMating);
healthRouter.delete('/matings/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteMating);

// ═══════════════════════════════════════════════════════════════════════════════
// GESTATIONS
// ═══════════════════════════════════════════════════════════════════════════════
healthRouter.get('/:animalId/gestations', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getGestations);
healthRouter.get('/:animalId/gestations/active', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.getActiveGestation);
healthRouter.post('/:animalId/gestations', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.createGestation);
healthRouter.put('/gestations/:id', requireRole('ADMIN', 'CRIADOR', 'VET'), ctrl.updateGestation);
healthRouter.delete('/gestations/:id', requireRole('ADMIN', 'CRIADOR'), ctrl.deleteGestation);
