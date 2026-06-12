import { pool } from '../config/db';

/**
 * Constrói dinamicamente um UPDATE SQL para partial updates.
 * Apenas os campos presentes em `data` (com valor !== undefined) são incluídos no SET.
 * Evita o bug de `undefined` → NULL em colunas NOT NULL.
 *
 * @param table  Nome da tabela (ex: 'litters')
 * @param id     UUID do registro a atualizar
 * @param data   Objeto com campos a atualizar
 * @param fieldMap  Mapeamento { campoCamelCase: 'coluna_sql', ... }
 * @param userId    ID do usuário para isolamento (opcional)
 * @returns O registro atualizado, ou null se nenhum campo foi fornecido.
 */
export async function buildUpdateQuery(
  table: string,
  id: string,
  data: any,
  fieldMap: Record<string, string>,
  userId?: string,
): Promise<any | null> {
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

/**
 * Versão para tabelas que usam `uploaded_by` em vez de `created_by` no filtro de isolamento.
 */
export async function buildUpdateQueryUploadedBy(
  table: string,
  id: string,
  data: any,
  fieldMap: Record<string, string>,
  userId?: string,
): Promise<any | null> {
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

  if (fields.length === 0) return null;

  fields.push('updated_at = CURRENT_TIMESTAMP');

  values.push(id);
  const idParam = paramIndex;
  paramIndex++;

  const userIdParam = userId ?? null;
  values.push(userIdParam);
  const userWhereParam = paramIndex;

  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${idParam} AND ($${userWhereParam}::uuid IS NULL OR uploaded_by = $${userWhereParam}) RETURNING *`;
  const res = await pool.query(sql, values);
  return res.rows[0];
}
