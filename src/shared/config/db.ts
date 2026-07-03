import { Pool } from 'pg';

// Lazy singleton: Pool is created on first query, not at module load time.
// This prevents crashes in Vercel serverless where env vars may not be available
// during module initialization but ARE available at request time.

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL environment variable is required. ' +
        'Configure it in your Vercel dashboard under Settings → Environment Variables.'
      );
    }

    // For external connections (Supabase), SSL is configured via the `ssl` option below.
    // Do NOT add sslmode=require to the URL — pg v8+ treats it as verify-full,
    // which ignores ssl.rejectUnauthorized and breaks self-signed certs.
    const isLocal = connectionString.includes('localhost');
    const url = new URL(connectionString);
    // Remove sslmode from URL to prevent pg from overriding our ssl config
    url.searchParams.delete('sslmode');
    const finalUrl = isLocal ? connectionString : url.toString();

    console.log('[DB] Initializing PostgreSQL connection pool');

    _pool = new Pool({
      connectionString: finalUrl,
      ssl: isLocal
        ? false
        : process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false'
          ? { rejectUnauthorized: false }
          : process.env.DB_CA_CERT
            ? { rejectUnauthorized: true, ca: process.env.DB_CA_CERT }
            : { rejectUnauthorized: false },
      max: parseInt(process.env.DB_POOL_MAX || '5', 10),
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      query_timeout: 10000,
      allowExitOnIdle: true,
    });

    _pool.on('error', (err) => {
      console.error('[DB POOL] Unexpected error on idle client:', err.message);
    });

    console.log('[DB] PostgreSQL pool created successfully');
  }
  return _pool;
}

// Proxy that lazily initializes the pool on first use.
// All pg Pool methods (query, connect, end) are forwarded.
export const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop, _receiver) {
    const p = getPool();
    const value = (p as any)[prop];
    if (typeof value === 'function') {
      return value.bind(p);
    }
    return value;
  },
});
