import { Pool } from "pg";
import { env } from "../config/env";
export const pool = new Pool({
  connectionString: env.databaseUrl
});
let closePoolPromise: Promise<void> | null = null;
export const closeDbPool = async (): Promise<void> => {
  if (closePoolPromise) {
    return closePoolPromise;
  }
  closePoolPromise = pool.end().catch(error => {
    closePoolPromise = null;
    throw error;
  });
  await closePoolPromise;
};
