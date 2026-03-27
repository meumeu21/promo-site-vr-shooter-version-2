import { closeDbPool, pool } from "../db/pool";
import { printDbConnectionHint } from "./dbConnectionError";
import { assertNonProduction } from "./seedDb";
type ResetResult = {
  matchesTruncated: number;
};
export const resetDb = async (): Promise<ResetResult> => {
  const countsBefore = await pool.query<{
    matches_count: string;
  }>(`
      SELECT
        (SELECT COUNT(*)::text FROM matches) AS matches_count
    `);
  await pool.query("TRUNCATE TABLE match_player_stats, match_teams, matches, players, clubs RESTART IDENTITY CASCADE");
  const row = countsBefore.rows[0];
  return {
    matchesTruncated: Number(row.matches_count)
  };
};
const main = async (): Promise<void> => {
  assertNonProduction("db:reset");
  try {
    const result = await resetDb();
    console.log(`[db:reset] Done. Truncated matches=${result.matchesTruncated}, total=${result.matchesTruncated}; identities restarted.`);
  } finally {
    await closeDbPool();
  }
};
if (require.main === module) {
  main().catch(error => {
    printDbConnectionHint("db:reset", error);
    console.error("[db:reset] Failed", error);
    process.exit(1);
  });
}
