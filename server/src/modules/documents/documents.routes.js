// 1. Import: Router di Express, requireAuth, upload
import express from "express";
import requireAuth from "../../middleware/requireAuth.js";
import upload from "../../middleware/upload.js";
import { getJobStatus, uploadDocument } from "./documents.service.js";

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

routerDocuments.get("/jobs/:jobId", requireAuth, async (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.userId;

  const job = await getJobStatus(jobId, userId);

  return res.status(200).json({ job });
});

// 4. Export del router
export default routerDocuments;
