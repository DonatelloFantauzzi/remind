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
export async function createUser(email, passwordHash, name) {
  const result = await pool.query(
    "INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id,email,name,avatar_url,created_at",
    [email, passwordHash, name],
  );
  return result.rows[0];
}
