// 1. Import: Router di Express, requireAuth, upload
import express from "express";
import requireAuth from "../../middleware/requireAuth.js";
import upload from "../../middleware/upload.js";
import { uploadDocument } from "./documents.service.js";

// 2. Il router
const routerDocuments = express.Router();

// 3. POST / — riceve un file
routerDocuments.post("/", requireAuth, upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File mancante" });
  }
  const result = await uploadDocument(req.userId, req.file);

  return res.status(201).json({ document: result });
});

// 4. Export del router
export default routerDocuments;
