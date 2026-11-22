import pool from "../db/pool.js";

export async function createJob(client, documentId, userId) {
  const result = await client.query(
    "INSERT INTO jobs(document_id,user_id) VALUES($1,$2) RETURNING id",
    [documentId, userId],
  );

  return result.rows[0];
}

export async function claimNextJob() {
  const result = await pool.query(
    "UPDATE jobs SET status = 'processing', updated_at = now() WHERE id=(SELECT id FROM jobs WHERE status='pending' ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED ) RETURNING id, user_id, document_id",
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function completeJob(client, jobId) {
  await client.query(
    "UPDATE jobs SET status='done', progress=100, updated_at=now() WHERE id=$1",
    [jobId],
  );
}

export async function failJob(jobId, message) {
  await pool.query(
    "UPDATE jobs SET status='failed', error_message=$1, updated_at=now() WHERE id=$2",
    [message, jobId],
  );
}

export async function findJobById(jobId, userId) {
  const result = await pool.query(
    "SELECT status, progress, step, error_message FROM jobs WHERE id=$1 AND user_id=$2",
    [jobId, userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}
