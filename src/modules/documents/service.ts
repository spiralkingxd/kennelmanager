import { DocumentsRepository } from './repository';
import { AppError } from '../../shared/utils/AppError';

export class DocumentsService {
  private repo: DocumentsRepository;
  constructor() { this.repo = new DocumentsRepository(); }

  public async getAll(skip: number, take: number, userId?: string) {
    const data = await this.repo.findAll(skip, take, userId);
    const total = await this.repo.count(userId);
    return { data, total };
  }

  public async getByAnimal(animalId: string, userId?: string) {
    return this.repo.findByAnimal(animalId, userId);
  }

  public async getById(id: string, userId?: string) {
    const doc = await this.repo.findById(id, userId);
    if (!doc) throw new AppError('Documento não encontrado', 404, true, 'NOT_FOUND');
    return doc;
  }

  public async create(data: any) {
    return this.repo.create(data);
  }

  public async update(id: string, data: any, userId?: string) {
    await this.getById(id, userId);
    return this.repo.update(id, data, userId);
  }

  public async delete(id: string, userId?: string) {
    await this.getById(id, userId);
    return this.repo.delete(id, userId);
  }
}
