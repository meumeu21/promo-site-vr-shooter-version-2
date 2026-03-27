import { runMigrations } from "../db/migrate";
import { closeDbPool } from "../db/pool";
const main = async (): Promise<void> => {
  try {
    await runMigrations();
    console.log("Database initialized");
  } finally {
    await closeDbPool();
  }
};
main().catch(error => {
  console.error("Failed to initialize database", error);
  process.exit(1);
});
