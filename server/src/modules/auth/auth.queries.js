import pool from "../../db/pool.js";

// Cerca un utente per email. Serve al login: restituisce anche password_hash.
// Se non esiste, restituisce null.
export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT id,email,name,avatar_url,created_at,password_hash FROM users WHERE email=$1",
    [email],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

// Crea un utente e restituisce la riga creata, senza password_hash.
export async function createUser(email, passwordHash, name, avatarUrl) {
  const result = await pool.query(
    "INSERT INTO users(email,password_hash,name,avatar_url) VALUES($1,$2,$3,$4) RETURNING id,email,name,avatar_url,created_at",
    [email, passwordHash, name, avatarUrl],
  );
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    "SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function findOAuthAccount(provider, providerUserId) {
  const result = await pool.query(
    "SELECT user_id FROM oauth_accounts WHERE provider=$1 AND provider_user_id=$2",
    [provider, providerUserId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export async function createOAuthAccount(provider, userId, providerUserId) {
  const result = await pool.query(
    "INSERT INTO oauth_accounts(provider,user_id,provider_user_id) VALUES($1,$2,$3)",
    [provider, userId, providerUserId],
  );
}
