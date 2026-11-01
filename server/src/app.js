// 1. Importa express
import express from "express";

// 2. Crea l'app
const app = express();

// 3. Middleware globali
//    Per ora uno solo: quello che legge il corpo JSON delle richieste
app.use(express.json());

// 4. Route di prova: GET /api/health
//    Risponde con un JSON tipo { status: "ok" }
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 5. Esporta l'app (export default), così index.js può accenderla
export default app;
