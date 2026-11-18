import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db/pool.js";
import errorHandler from "./middleware/errorHandler.js";
import routerAuth from "./modules/auth/auth.routes.js";
import notFound from "./middleware/notFound.js";
import routerDocuments from "./modules/documents/documents.routes.js";

const app = express();

// trust proxy: quanti intermediari ci sono tra il client ed Express.
// Online la catena è: browser → Vercel → Cloudflare → bilanciatore di Render
// → proxy locale (::1) → Express. Contando da ::1 (passo 0), il client è al passo 4.
// Così req.ip è l'IP vero del client, e il rate limiting conta per persona.
// Numero trovato con /api/debug/ip (novembre 2026): se Vercel o Render cambiano
// infrastruttura va ricontrollato.
// Limite noto: chi chiama Render direttamente salta Vercel e può falsificare l'IP.
app.set("trust proxy", 4);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", routerAuth);

app.use("/api/documents", routerDocuments);

app.get("/api/health", async (req, res) => {
  const result = await pool.query("SELECT now()");
  res.status(200).json({ status: "ok", database: result.rows[0].now });
});

app.use(notFound);

app.use(errorHandler);

export default app;
