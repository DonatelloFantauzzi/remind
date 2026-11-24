import pool from "../../db/pool.js";

export async function createDocument(
  client,
  userId,
  originalname,
  mimeType,
  sizeBytes,
  contentHash,
  text,
) {
  const result = await client.query(
    "INSERT INTO documents(user_id,filename,mime_type,size_bytes,content_hash,text) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
    [userId, originalname, mimeType, sizeBytes, contentHash, text],
  );

  return result.rows[0];
}

export async function findDocumentText(documentId, userId) {
  const result = await pool.query(
    "SELECT text FROM documents WHERE id = $1 AND user_id = $2",
    [documentId, userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function createChunk(
  client,
  documentId,
  userId,
  chunkIndex,
  startOffset,
  endOffset,
  content,
) {
  await client.query(
    "INSERT INTO chunks(document_id, user_id, chunk_index, start_offset, end_offset, content) VALUES($1, $2, $3, $4, $5, $6)",
    [documentId, userId, chunkIndex, startOffset, endOffset, content],
  );
}

export async function findDocumentsByUser(userId) {
  const result = await pool.query(
    "SELECT d.id, d.filename, j.id AS job_id, j.status, j.progress, j.step, j.error_message FROM documents AS d JOIN jobs AS j ON j.document_id=d.id WHERE d.user_id=$1 ORDER BY d.filename",
    [userId],
  );

  return result.rows;
}
