// Le route HTTP del modulo auth: validano l'input, chiamano il service, rispondono.
// Gli errori lanciati dal service arrivano da soli a errorHandler (Express 5).

import express from "express";
import { register, login, getMe } from "./auth.service.js";
import config from "../../config.js";
import requireAuth from "../../middleware/requireAuth.js";

const routerAuth = express.Router();

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

  const options = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie("token", token, options);
  return res.status(200).json({ user });
});

routerAuth.get("/me", requireAuth, async (req, res) => {
  const userId = req.userId;
  const user = await getMe(userId);
  return res.status(200).json({ user });
});

export default routerAuth;
