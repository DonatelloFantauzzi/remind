import express from "express";
import pool from "./db/pool.js";

const app = express();

app.use(express.json());

app.get("/api/health", async (req, res) => {
  const result = await pool.query("SELECT now()");
  res.status(200).json({ status: "ok", database: result.rows[0].now });
});

export default app;
