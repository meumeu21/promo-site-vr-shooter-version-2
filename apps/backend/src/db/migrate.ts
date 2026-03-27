import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool";
import { logInfo } from "../utils/logger";
const HISTORY_TABLES = ["clubs", "players", "matches", "match_teams", "match_player_stats"] as const;
const getExistingHistoryTables = async (): Promise<string[]> => {
  const result = await pool.query<{
    table_name: string;
  }>(`SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])
     ORDER BY table_name ASC`, [HISTORY_TABLES]);
  return result.rows.map(row => row.table_name);
};
export const runMigrations = async (): Promise<void> => {
  const sqlPath = path.resolve(process.cwd(), "sql/init.sql");
  const sql = await fs.readFile(sqlPath, "utf8");
  await pool.query(sql);
  const existingHistoryTables = await getExistingHistoryTables();
  logInfo("db_migrations_complete", "Database schema initialized", {
    historyTables: existingHistoryTables,
    historySchemaReady: HISTORY_TABLES.every(tableName => existingHistoryTables.includes(tableName))
  });
};
