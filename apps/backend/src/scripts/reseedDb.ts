import { closeDbPool } from "../db/pool";
import { printDbConnectionHint } from "./dbConnectionError";
import { resetDb } from "./resetDb";
import { seedDb, assertNonProduction } from "./seedDb";
const main = async (): Promise<void> => {
  assertNonProduction("db:reseed");
  try {
    const resetResult = await resetDb();
    const seedResult = await seedDb();
    console.log(`[db:reseed] Done. Truncated matches=${resetResult.matchesTruncated}; inserted matches=${seedResult.matchesImported}, total_inserted=${seedResult.matchesImported}`);
  } finally {
    await closeDbPool();
  }
};
if (require.main === module) {
  main().catch(error => {
    printDbConnectionHint("db:reseed", error);
    console.error("[db:reseed] Failed", error);
    process.exit(1);
  });
}
