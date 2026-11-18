// server/src/documents/documents.service.js

// import da node:crypto
import { createHash } from "node:crypto";
import { extractText } from "./extract.js";
import pool from "../../db/pool.js";
import { createDocument } from "./documents.queries.js";
import { createJob } from "../../jobs/jobs.queries.js";

// funzione esportata per il caricamento di un documento
// riceve: l'id dell'utente e il file di multer
// è async: più avanti farà query e transazione
export async function uploadDocument(userId, file) {
  const { buffer, originalname, mimetype, size } = file;
  // 1. impronta SHA-256 dei byte del file
  const contentHash = createHash("sha256").update(buffer).digest("hex");

  // 2. estrazione del testo
  const text = await extractText(buffer, originalname);
  // 3. documento + job in transazione

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const document = await createDocument(
      client,
      userId,
      originalname,
      mimetype,
      size,
      contentHash,
      text,
    );
    const job = await createJob(client, document.id, userId);
    await client.query("COMMIT");
    return { documentId: document.id, jobId: job.id };
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      const err = new Error("Hai già caricato questo documento");
      err.status = 409;
      throw err;
    }
    throw error;
  } finally {
    client.release();
  }
}
