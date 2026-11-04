import { readdir, readFile } from "node:fs/promises";
import pool from "./pool.js";

await pool.query(
  `CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())`,
);

const migrationsFolder = new URL("./migrations/", import.meta.url);
const fileMigrationsFolder = await readdir(migrationsFolder);
const fileSQL = fileMigrationsFolder
  .filter((file) => file.endsWith(".sql"))
  .sort();

const resultOfNameColumn = await pool.query(
  "SELECT name FROM schema_migrations",
);
const nameOfMigrations = resultOfNameColumn.rows.map((row) => row.name);

const appliedMigrations = new Set(nameOfMigrations);

let counter = 0;

for (const file of fileSQL) {
  if (appliedMigrations.has(file)) {
    continue;
  }

  const fileContent = await readFile(new URL(file, migrationsFolder), "utf8");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(fileContent);

    await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
      file,
    ]);
    await client.query("COMMIT");
    console.log(`Eseguita : ${file}`);
    counter++;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
if (counter === 0) {
  console.log("Nessuna migrazione eseguita");
}
await pool.end();
