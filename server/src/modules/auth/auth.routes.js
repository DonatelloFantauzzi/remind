// Le route HTTP del modulo auth: validano l'input, chiamano il service, rispondono.
// Gli errori lanciati dal service arrivano da soli a errorHandler (Express 5).

import express from "express";
import {
  register,
  login,
  getMe,
  getGoogleAuthUrl,
  googleLogin,
} from "./auth.service.js";
import { randomBytes } from "crypto";
import config from "../../config.js";
import requireAuth from "../../middleware/requireAuth.js";

const routerAuth = express.Router();

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: "lax",
};

const tokenCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

routerAuth.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!email) {
    return res.status(400).json({ error: "Email mancante" });
  }

  if (typeof email !== "string") {
    return res.status(400).json({ error: "La mail non è nel formato valido" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "La mail non contiene '@'" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password mancante" });
  }

  if (typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "La password non è nel formato valido" });
  }

  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({
      error: "La password deve essere compresa tra 8 e 128 caratteri",
    });
  }

  if (name && typeof name !== "string") {
    return res.status(400).json({
      error: "Il nome deve essere una stringa",
    });
  }

  const user = await register(email, password, name);
  return res.status(201).json({ user });
});

routerAuth.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    !email ||
    typeof email !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Credenziali non valide" });
  }

  const { user, token } = await login(email, password);

  res.cookie("token", token, tokenCookieOptions);
  return res.status(200).json({ user });
});

routerAuth.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.sendStatus(204);
});

routerAuth.get("/me", requireAuth, async (req, res) => {
  const userId = req.userId;
  const user = await getMe(userId);
  return res.status(200).json({ user });
});

routerAuth.get("/google", (req, res) => {
  const state = randomBytes(16).toString("hex");
  const stateCookieOptions = {
    ...cookieOptions,
    maxAge: 10 * 60 * 1000,
  };

  res.cookie("oauth_state", state, stateCookieOptions);
  res.redirect(getGoogleAuthUrl(state));
});

routerAuth.get("/google/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const oauthState = req.cookies.oauth_state;
  res.clearCookie("oauth_state", cookieOptions);
  if (!code || !oauthState || error || state !== oauthState) {
    return res.redirect("/login?error=google");
  }
  let loginResult;

  try {
    loginResult = await googleLogin(code);
  } catch (err) {
    console.error(err);
    return res.redirect("/login?error=google");
  }
  const { user, token } = loginResult;
  res.cookie("token", token, tokenCookieOptions);

  return res.redirect("/graph");
});

export default routerAuth;
