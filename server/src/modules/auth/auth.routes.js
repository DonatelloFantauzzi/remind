// Le route HTTP del modulo auth: validano l'input, chiamano il service, rispondono.
// Gli errori lanciati dal service arrivano da soli a errorHandler (Express 5).

import express from "express";
import { register } from "./auth.service.js";

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

export default routerAuth;
