import express from "express";
import cookieParser from "cookie-parser";
import pool from "./db/pool.js";
import errorHandler from "./middleware/errorHandler.js";
import routerAuth from "./modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", routerAuth);

app.get("/api/health", async (req, res) => {
  const result = await pool.query("SELECT now()");
  res.status(200).json({ status: "ok", database: result.rows[0].now });
});

app.use(errorHandler);

export default app;
