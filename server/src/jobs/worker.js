// server/src/jobs/worker.js
// Il worker: l'addetto nel retro della lavanderia.
// Prende un job pending alla volta, divide in pezzi il testo del documento,
// salva i pezzi e chiude il job (done o failed). Gira dentro il processo di Express,
// senza che nessuna richiesta lo chiami.

import pool from "../db/pool.js";
import { claimNextJob, completeJob, failJob } from "./jobs.queries.js";
import {
  findDocumentText,
  createChunk,
} from "../modules/documents/documents.queries.js";
import { chunkText } from "../modules/documents/chunk.js";

// Quanto aspettare prima del prossimo giro quando la fila è vuota, in millisecondi
const idleDelayMs = 3000;
const userErrorMessage = `Elaborazione del documento non riuscita`;

// Un giro: prende al massimo un job e lo lavora.
// Restituisce true se ha trovato un job, false se la fila era vuota:
// al ciclo serve per decidere se ripartire subito o aspettare.
async function processNextJob() {
  const job = await claimNextJob();

  if (!job) {
    return false;
  }

  const document = await findDocumentText(job.document_id, job.user_id);
  if (!document) {
    console.error(`Job ${job.id}: documento non trovato`);
    await failJob(job.id, userErrorMessage);
    return true;
  }

  const chunks = chunkText(document.text);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (const chunk of chunks) {
      await createChunk(
        client,
        job.document_id,
        job.user_id,
        chunk.chunkIndex,
        chunk.startOffset,
        chunk.endOffset,
        chunk.content,
      );
    }
    await completeJob(client, job.id);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    await failJob(job.id, userErrorMessage);
  } finally {
    client.release();
  }

  return true;
}

// Il ciclo: un giro, poi programma il prossimo (pezzo C).
// La chiama index.js dopo listen.
export async function startWorker() {
  let foundJob = false;
  try {
    foundJob = await processNextJob();
  } catch (error) {
    console.error(error);
  }

  setTimeout(startWorker, foundJob ? 0 : idleDelayMs);
}
