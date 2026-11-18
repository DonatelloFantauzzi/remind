// documents.routes.js — route dei documenti, montate sotto /api/documents.

// 1. Import: Router di Express, requireAuth, upload
import express from "express";
import requireAuth from "../../middleware/requireAuth.js";
import upload from "../../middleware/upload.js";

// 2. Il router
const routerDocuments = express.Router();

// 3. POST / — riceve un file (prova: risponde con i dati di req.file)
routerDocuments.post("/", requireAuth, upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File mancante" });
  }

  const { originalname, mimetype, size } = req.file;

  return res.status(201).json({ document: { originalname, mimetype, size } });
});

// 4. Export del router
export default routerDocuments;
