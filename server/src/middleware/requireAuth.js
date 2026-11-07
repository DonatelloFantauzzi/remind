import jwt from "jsonwebtoken";
import config from "../config.js";

export default function requireAuth(req, res, next) {
  let payloadUser;
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Non autenticato" });
  }
  try {
    // 2. il sigillo è valido? (attenzione: jwt.verify lancia)
    payloadUser = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return res.status(401).json({ error: "Non autenticato" });
  }

  // 3. chi è l'utente → sulla richiesta, poi avanti
  req.userId = payloadUser.sub;

  next();
}
