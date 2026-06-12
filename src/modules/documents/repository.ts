import { pool } from '../../shared/config/db';
import { buildUpdateQueryUploadedBy } from '../../shared/utils/updateHelper';

export class DocumentsRepository {
  public async findAll(skip: number, take: number, userId?: string) {
    const res = await pool.query(
      'SELECT d.*, u.name AS uploaded_by_name FROM documents d LEFT JOIN users u ON u.id = d.uploaded_by WHERE ($3::uuid IS NULL OR d.uploaded_by = $3) ORDER BY d.created_at DESC LIMIT $1 OFFSET $2',
      [take, skip, userId ?? null]
    );
    return res.rows;
  }

  public async count(userId?: string) {
    const query = 'SELECT COUNT(*) FROM documents WHERE ($1::uuid IS NULL OR uploaded_by = $1)';
    const params: any[] = [userId ?? null];
    const res = await pool.query(query, params);
    return parseInt(res.rows[0].count, 10);
  }

  public async findByAnimal(animalId: string, userId?: string) {
    const res = await pool.query(
      'SELECT * FROM documents WHERE animal_id = $1 AND ($2::uuid IS NULL OR uploaded_by = $2) ORDER BY created_at DESC',
      [animalId, userId ?? null]
    );
    return res.rows;
  }

  public async findById(id: string, userId?: string) {
    const res = await pool.query('SELECT * FROM documents WHERE id = $1 AND ($2::uuid IS NULL OR uploaded_by = $2)', [id, userId ?? null]);
    return res.rows[0] || null;
  }

  public async create(data: any) {
    const res = await pool.query(
      `INSERT INTO documents (animal_id, client_id, type, name, file_path, file_size, mime_type, description, uploaded_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       RETURNING *`,
      [data.animalId, data.clientId, data.type, data.name, data.filePath,
       data.fileSize, data.mimeType, data.description, data.uploadedBy]
    );
    return res.rows[0];
  }

  public async update(id: string, data: any, userId?: string) {
    const row = await buildUpdateQueryUploadedBy('documents', id, data, {
      animalId: 'animal_id',
      clientId: 'client_id',
      type: 'type',
      name: 'name',
      filePath: 'file_path',
      fileSize: 'file_size',
      mimeType: 'mime_type',
      description: 'description',
    }, userId);
    return row;
  }

  public async delete(id: string, userId?: string) {
    const res = await pool.query('DELETE FROM documents WHERE id = $1 AND ($2::uuid IS NULL OR uploaded_by = $2) RETURNING *', [id, userId ?? null]);
    return res.rows[0];
  }
}
