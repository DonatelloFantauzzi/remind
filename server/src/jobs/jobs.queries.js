export async function createJob(client, documentId, userId) {
  const result = await client.query(
    "INSERT INTO jobs(document_id,user_id) VALUES($1,$2) RETURNING id",
    [documentId, userId],
  );

  return result.rows[0];
}
