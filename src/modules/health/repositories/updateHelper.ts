import { pool } from '../../../shared/config/db';

/**
 * Constrói dinamicamente um UPDATE SQL para partial updates.
 * Apenas os campos presentes em `data` (com valor !== undefined) são incluídos no SET.
 * Evita o bug de `undefined` → NULL em colunas NOT NULL.
 *
 * @returns O registro atualizado, ou null se nenhum campo foi fornecido.
 */
export async function buildUpdateQuery(
  table: string,
  id: string,
  data: any,
  fieldMap: Record<string, string>,
  userId?: string,
) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, col] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${paramIndex}`);
      values.push(data[key]);
      paramIndex++;
    }
  }

  // Se nenhum campo foi fornecido, retornar o registro atual sem modificação
  if (fields.length === 0) return null;

  fields.push('updated_at = CURRENT_TIMESTAMP');

  values.push(id);
  const idParam = paramIndex;
  paramIndex++;

  const userIdParam = userId ?? null;
  values.push(userIdParam);
  const userWhereParam = paramIndex;

  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${idParam} AND ($${userWhereParam}::uuid IS NULL OR created_by = $${userWhereParam}) RETURNING *`;
  const res = await pool.query(sql, values);
  return res.rows[0];
}
