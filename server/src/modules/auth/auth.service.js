// La logica del modulo auth. Non sa niente di HTTP: niente req, res o cookie.
// Riceve dati già validati dalla route, usa le queries, lancia errori con uno status.

import argon2 from "argon2";
import jwt from "jsonwebtoken";
import config from "../../config.js";
import {
  findUserByEmail,
  createUser,
  findUserById,
  findOAuthAccount,
  createOAuthAccount,
} from "./auth.queries.js";

const googleBaseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleRedirectUri = `${config.appUrl}/api/auth/google/callback`;

const githubBaseUrl = "https://github.com/login/oauth/authorize";
const githubRedirectUri = `${config.appUrl}/api/auth/github/callback`;
const githubTokenUrl = "https://github.com/login/oauth/access_token";
const githubUserUrl = "https://api.github.com/user";
const githubUserEmail = "https://api.github.com/user/emails";

function assertEmailAllowed(email) {
  if (config.allowedEmails && !config.allowedEmails.includes(email)) {
    const error = new Error("Accesso non consentito");
    error.status = 403;
    throw error;
  }
}

// Registrazione: crea un utente e lo restituisce, senza password_hash.
export async function register(email, password, name) {
  // 1. Normalizza l'email: minuscolo e senza spazi ai lati.
  const normalizedEmail = email.trim().toLowerCase();
  assertEmailAllowed(normalizedEmail);
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
  assertEmailAllowed(normalizedEmail);
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

export async function getMe(userId) {
  const user = await findUserById(userId);
  if (!user) {
    const error = new Error("Non autenticato");
    error.status = 401;
    throw error;
  }
  return user;
}

export function getGoogleAuthUrl(state) {
  const googleParams = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: state,
  });

  const googleOauthUrl = `${googleBaseUrl}?${googleParams}`;

  return googleOauthUrl;
}

export async function googleLogin(code) {
  const tokenParams = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: googleRedirectUri,
    grant_type: "authorization_code",
    client_secret: config.googleClientSecret,
    code,
  });

  const response = await fetch(googleTokenUrl, {
    method: "POST",
    body: tokenParams,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    const error = new Error("Accesso con Google non riuscito");
    error.status = 401;
    throw error;
  }

  const googleProfile = jwt.decode(data.id_token);

  if (!googleProfile.email_verified) {
    const error = new Error("Accesso con Google non riuscito");
    error.status = 401;
    throw error;
  }

  const normalizedEmail = googleProfile.email.trim().toLowerCase();
  assertEmailAllowed(normalizedEmail);
  let userId;

  const oauthAccount = await findOAuthAccount("google", googleProfile.sub);

  if (oauthAccount) {
    userId = oauthAccount.user_id;
  } else {
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      userId = existingUser.id;
      await createOAuthAccount("google", userId, googleProfile.sub);
    } else {
      const newUser = await createUser(
        normalizedEmail,
        null,
        googleProfile.name,
        googleProfile.picture,
      );

      userId = newUser.id;
      await createOAuthAccount("google", userId, googleProfile.sub);
    }
  }

  const user = await findUserById(userId);
  const payload = { sub: user.id };
  const secretKey = config.jwtSecret;
  const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });

  return { user, token };
}

export function getGithubAuthUrl(state) {
  const githubParams = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: githubRedirectUri,
    scope: "user:email",
    state: state,
  });

  const githubOauthUrl = `${githubBaseUrl}?${githubParams}`;
  return githubOauthUrl;
}

export async function githubLogin(code) {
  const tokenParams = new URLSearchParams({
    client_id: config.githubClientId,
    client_secret: config.githubClientSecret,
    redirect_uri: githubRedirectUri,
    code,
  });

  const response = await fetch(githubTokenUrl, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: tokenParams,
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    console.error(data);
    const error = new Error("Accesso con GitHub non riuscito");
    error.status = 401;
    throw error;
  }

  const userResponse = await fetch(githubUserUrl, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const userData = await userResponse.json();

  if (!userResponse.ok) {
    console.error(userData);
    const error = new Error("Accesso con GitHub non riuscito");
    error.status = 401;
    throw error;
  }

  const emailResponse = await fetch(githubUserEmail, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const emailData = await emailResponse.json();

  if (!emailResponse.ok) {
    console.error(emailData);
    const error = new Error("Accesso con GitHub non riuscito");
    error.status = 401;
    throw error;
  }

  const primaryEmail = emailData.find(
    (email) => email.primary === true && email.verified === true,
  );

  if (!primaryEmail) {
    const error = new Error("Accesso con GitHub non riuscito");
    error.status = 401;
    throw error;
  }

  const normalizedEmail = primaryEmail.email.trim().toLowerCase();
  assertEmailAllowed(normalizedEmail);

  const oauthAccount = await findOAuthAccount("github", userData.id.toString());
  let userId;

  if (oauthAccount) {
    userId = oauthAccount.user_id;
  } else {
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      userId = existingUser.id;
      await createOAuthAccount("github", userId, userData.id.toString());
    } else {
      const name = userData.name || userData.login;
      const newUser = await createUser(
        normalizedEmail,
        null,
        name,
        userData.avatar_url,
      );

      userId = newUser.id;
      await createOAuthAccount("github", userId, userData.id.toString());
    }
  }

  const user = await findUserById(userId);
  const payload = { sub: user.id };
  const secretKey = config.jwtSecret;
  const token = jwt.sign(payload, secretKey, { expiresIn: "7d" });

  return { user, token };
}
