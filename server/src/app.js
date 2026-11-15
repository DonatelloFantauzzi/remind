import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db/pool.js";
import errorHandler from "./middleware/errorHandler.js";
import routerAuth from "./modules/auth/auth.routes.js";
import notFound from "./middleware/notFound.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", routerAuth);

app.get("/api/health", async (req, res) => {
  const result = await pool.query("SELECT now()");
  res.status(200).json({ status: "ok", database: result.rows[0].now });
});

app.get("/api/debug/ip", (req, res) => {
  res.status(200).json({
    socket: req.socket.remoteAddress,
    forwardedFor: req.headers["x-forwarded-for"],
    ip: req.ip,
  });
});

app.use(notFound);

app.use(errorHandler);

export default app;
