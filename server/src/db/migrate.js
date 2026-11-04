// Da Node prendo due funzioni per leggere il disco: readdir (elenco dei file
// in una cartella) e readFile (contenuto di un file). Il prefisso node:
// dice che è un modulo incluso in Node, non un pacchetto npm.
import { readdir, readFile } from "node:fs/promises";
// Il pool di connessioni a Neon. Importarlo fa partire anche config.js,
// quindi se manca DATABASE_URL lo script si ferma qui.
import pool from "./pool.js";

// PUNTO 1 — Il registro.
// Crea la tabella che tiene traccia delle migrazioni già eseguite, ma solo
// se non esiste ancora (IF NOT EXISTS), così si può rilanciare ogni volta.
// name: il nome del file, chiave primaria → nessuna migrazione segnata due volte.
// applied_at: quando è stata eseguita; se non la passo, Postgres mette l'ora attuale.
// await al primo livello del file: è il top-level await degli ES modules.
await pool.query(
  `CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())`,
);

// PUNTO 2 — Cosa andrebbe fatto: i file nella cartella migrations.
// Indirizzo completo della cartella, calcolato a partire da questo file
// (import.meta.url), così funziona da qualunque cartella lanci lo script.
// La barra finale dice che migrations è una cartella e non un file.
const migrationsFolder = new URL("./migrations/", import.meta.url);
// Array con i nomi di tutto ciò che c'è nella cartella (anche .gitkeep).
const fileMigrationsFolder = await readdir(migrationsFolder);
// Tengo solo i file .sql e li metto in ordine alfabetico:
// grazie agli zeri davanti (001, 002...) l'ordine alfabetico è quello giusto.
const fileSQL = fileMigrationsFolder
  .filter((file) => file.endsWith(".sql"))
  .sort();

// PUNTO 3 — Cosa è già stato fatto: i nomi nel registro.
// Il risultato è un oggetto; le righe stanno nella sua proprietà rows.
const resultOfNameColumn = await pool.query(
  "SELECT name FROM schema_migrations",
);
// Da [{ name: "001_x.sql" }, ...] a ["001_x.sql", ...]: solo i nomi.
const nameOfMigrations = resultOfNameColumn.rows.map((row) => row.name);

// Metto i nomi in un Set per chiedere velocemente "c'è o non c'è?" con has.
const appliedMigrations = new Set(nameOfMigrations);

// Conta le migrazioni eseguite in questo lancio. Nasce fuori dal ciclo,
// così non si azzera a ogni giro ed è visibile anche dopo il ciclo.
let counter = 0;

// PUNTO 4 — Il confronto, un file alla volta.
// for...of aspetta ogni await prima di passare al file successivo:
// le migrazioni partono in ordine, una dopo l'altra (forEach non aspetterebbe).
for (const file of fileSQL) {
  // Se il file è già nel registro, salto questo giro e passo al prossimo.
  if (appliedMigrations.has(file)) {
    continue;
  }

  // Leggo il contenuto del file come testo ("utf8"), cioè l'SQL da eseguire.
  // new URL(file, migrationsFolder) costruisce l'indirizzo del file dentro la cartella.
  const fileContent = await readFile(new URL(file, migrationsFolder), "utf8");

  // Prendo una connessione tutta per me dal pool (il "taxi"):
  // la transazione deve fare tutte le tappe sulla stessa connessione.
  const client = await pool.connect();

  try {
    // Apro la transazione: da qui in poi i cambiamenti sono provvisori.
    await client.query("BEGIN");

    // Mando a Postgres l'SQL letto dal file, che lo esegue.
    await client.query(fileContent);

    // Segno il file nel registro. $1 è un segnaposto: il nome viaggia a parte,
    // nell'array, così Postgres non lo confonde mai con un comando.
    await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
      file,
    ]);
    // Confermo: l'SQL del file e la riga nel registro diventano definitivi insieme.
    await client.query("COMMIT");
    // Lo stampo solo dopo il COMMIT, cioè quando è davvero andata a buon fine.
    console.log(`Eseguita : ${file}`);
    // Un'altra migrazione eseguita in questo lancio.
    counter++;
  } catch (error) {
    // Una tappa è fallita: annullo tutto ciò che la transazione aveva fatto.
    await client.query("ROLLBACK");
    // Rilancio l'errore: lo script si ferma e non passa alla migrazione dopo,
    // che potrebbe dipendere da questa.
    throw error;
  } finally {
    // Eseguito sempre, sia dopo il successo sia dopo l'errore:
    // restituisco la connessione al pool.
    client.release();
  }
}
// Se il ciclo non ha eseguito niente, lo dico: nei log di Render
// si vede comunque che lo script è passato.
if (counter === 0) {
  console.log("Nessuna migrazione eseguita");
}
// PUNTO 5 — Chiudo tutte le connessioni del pool, così Node termina subito
// e su Render il server può partire.
await pool.end();
