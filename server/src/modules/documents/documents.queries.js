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
