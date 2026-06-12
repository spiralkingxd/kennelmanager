import { Request, Response, NextFunction } from 'express';
import { HealthService } from './service';
import { isolationUserId } from '../../shared/utils/adminHelpers';
import { createVaccinesController } from './controllers/VaccinesController';
import { createDewormingController } from './controllers/DewormingController';
import { createExamsController } from './controllers/ExamsController';
import { createConsultationsController } from './controllers/ConsultationsController';
import { createMedicationsController } from './controllers/MedicationsController';
import { createWeightController } from './controllers/WeightController';
import { createHeatCyclesController } from './controllers/HeatCyclesController';
import { createMatingsController } from './controllers/MatingsController';
import { createGestationsController } from './controllers/GestationsController';

export class HealthController {
  private service: HealthService;

  declare getVaccines: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createVaccine: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateVaccine: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteVaccine: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getDeworming: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createDeworming: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateDeworming: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteDeworming: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getExams: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteExam: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getConsultations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createConsultation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateConsultation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteConsultation: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getMedications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createMedication: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateMedication: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteMedication: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getWeightHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createWeight: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteWeight: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getHeatCycles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createHeatCycle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateHeatCycle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteHeatCycle: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getMatings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createMating: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateMating: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteMating: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  declare getGestations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare getActiveGestation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare createGestation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare updateGestation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  declare deleteGestation: (req: Request, res: Response, next: NextFunction) => Promise<void>;

  constructor() {
    this.service = new HealthService();
    Object.assign(this,
      createVaccinesController(this.service),
      createDewormingController(this.service),
      createExamsController(this.service),
      createConsultationsController(this.service),
      createMedicationsController(this.service),
      createWeightController(this.service),
      createHeatCyclesController(this.service),
      createMatingsController(this.service),
      createGestationsController(this.service),
    );
    const methods = [
      'getOverview', 'getAnimalHealth',
      'getVaccines', 'createVaccine', 'updateVaccine', 'deleteVaccine',
      'getDeworming', 'createDeworming', 'updateDeworming', 'deleteDeworming',
      'getExams', 'createExam', 'updateExam', 'deleteExam',
      'getConsultations', 'createConsultation', 'updateConsultation', 'deleteConsultation',
      'getMedications', 'createMedication', 'updateMedication', 'deleteMedication',
      'getWeightHistory', 'createWeight', 'deleteWeight',
      'getHeatCycles', 'createHeatCycle', 'updateHeatCycle', 'deleteHeatCycle',
      'getMatings', 'createMating', 'updateMating', 'deleteMating',
      'getGestations', 'getActiveGestation', 'createGestation', 'updateGestation', 'deleteGestation',
    ];
    methods.forEach(m => { (this as any)[m] = (this as any)[m].bind(this); });
  }

  // ─── Overview (cross-animal health dashboard) ─────────────────────────────
  public async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getOverview(isolationUserId(req));
      return res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  // ─── Grouped ───────────────────────────────────────────────────────────────
  public async getAnimalHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.service.getAnimalHealth(req.params.animalId, isolationUserId(req));
      return res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }
}
