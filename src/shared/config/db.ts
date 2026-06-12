import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required. Configure it in .env file.');
}

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost')
    ? false
    : process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
      ? { rejectUnauthorized: false }
      : { rejectUnauthorized: true, ca: (process.env.DB_CA_CERT || undefined) },
  max: parseInt(process.env.DB_POOL_MAX || '5', 10),
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  query_timeout: 10000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('[DB POOL] Unexpected error on idle client:', err);
});
