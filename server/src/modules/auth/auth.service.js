// La logica del modulo auth. Non sa niente di HTTP: niente req, res o cookie.
// Riceve dati già validati dalla route, usa le queries, lancia errori con uno status.

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import config from "../../config.js";
import { findUserByEmail, createUser } from "./auth.queries.js";

// Registrazione: crea un utente e lo restituisce, senza password_hash.
export async function register(email, password, name) {
  // 1. Normalizza l'email: minuscolo e senza spazi ai lati.
  const normalizedEmail = email.trim().toLowerCase();
  // 2. Cerca se esiste già un utente con quell'email.
  //    Se esiste: lancia un errore con status 409 e un messaggio chiaro.
  const user = await findUserByEmail(normalizedEmail);
  if (user) {
    const error = new Error("Questa mail esiste già");
    error.status = 409;
    throw error;
  }
  // 3. Calcola l'hash della password con argon2 (asincrono).
  const passwordHashata = await argon2.hash(password);
  // 4. Crea l'utente con email normalizzata, hash e nome.
  const newUser = await createUser(normalizedEmail, passwordHashata, name);
  // 5. Restituisci l'utente creato.
  return newUser;
}

// Login: verifica le credenziali e restituisce { user, token }.
export async function login(email, password) {
  // 1. Normalizza l'email, come nella registrazione.
  const normalizedEmail = email.trim().toLowerCase();
  // 2. Cerca l'utente per email.
  const user = await findUserByEmail(normalizedEmail);
  // 3. Se l'utente non c'è, oppure non ha password_hash (entra solo con Google o GitHub):
  //    lancia un errore 401 con "Credenziali non valide".
  if (!user || !user.password_hash) {
    const error = new Error("Credenziali non valide");
    error.status = 401;
    throw error;
  }
  // 4. Confronta la password con argon2: prima l'hash salvato, poi la password digitata (asincrono).
  //    Se non corrisponde: stesso errore 401, stesso messaggio.
  const matchPassword = await argon2.verify(user.password_hash, password);
  if (!matchPassword) {
    const error = new Error("Credenziali non valide");
    error.status = 401;
    throw error;
  }
  // 5. Firma il token con jwt:
  //    payload { sub: id dell'utente }, segreto da config, scadenza di 7 giorni.
  const payload = { sub: user.id };
  const secretKey = config.jwtSecret;
  const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });
  // 6. Togli password_hash dall'utente: destrutturazione con il resto.
  const { password_hash, ...userProfile } = user;
  // 7. Restituisci un oggetto con l'utente pulito e il token.
  const userLogged = { user: userProfile, token };
  return userLogged;
}
