import { Pool } from "pg";

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined;
};

function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

export const pool = globalForPool.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
