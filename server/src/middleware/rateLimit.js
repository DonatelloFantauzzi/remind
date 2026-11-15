// server/src/middleware/rateLimit.js
//
// Limitatori per le route di autenticazione.
// I contatori stanno in memoria: si azzerano a ogni riavvio del server.
// Va bene così: su Render gira una sola istanza.

// 1. Import della funzione che crea i limitatori
import { rateLimit } from "express-rate-limit";

// 2. loginLimiter
//    conta solo i tentativi falliti, per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Troppe richieste, riprova più tardi." },
  skipSuccessfulRequests: true,
});

// 3. registerLimiter
//    conta tutte le registrazioni, per IP

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Troppe richieste, riprova più tardi." },
});
