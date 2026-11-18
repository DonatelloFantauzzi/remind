// upload.js — controllo all'ingresso dei file caricati (il metro dei bagagli al gate).
// Riceve un solo file in memoria (mai su disco: su Render non è persistente),
// scarta formati non ammessi e file troppo grandi prima che la route li elabori.
// Si usa nella route dopo requireAuth: router.post("/", requireAuth, upload, gestore).
import multer from "multer";
import { extname } from "node:path";

// Il cartello degli oggetti ammessi: le estensioni accettate,
// minuscole e con il punto, nello stesso formato che restituisce extname.
// Sta fuori dalla funzione perché è fissa e non dipende dalla richiesta.
const allowedExtensions = [".pdf", ".txt", ".docx", ".md"];

// L'addetto che guarda l'etichetta del bagaglio prima di misurarlo.
// Multer la chiama da sola, una volta per file, PRIMA di leggerne i byte:
// in `file` ci sono già originalname e mimetype, non ancora buffer e size.
// Deve restare sincrona: nelle versioni di multer prima della 2.3.0
// un fileFilter asincrono lasciava passare file oltre il limite (CVE-2026-77063).
const fileFilter = (req, file, cb) => {
  // Solo l'estensione, in minuscolo: "Dispensa ML.PDF" → ".pdf".
  // Il tipo dichiarato dal browser non conta: basta rinominare un file per ingannarlo.
  // Il contenuto vero lo verifica l'estrazione: un file finto non si legge e dà errore.
  const extension = extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(extension)) {
    // Verdetto positivo: nessun errore (null), file accettato (true).
    cb(null, true);
  } else {
    // Verdetto negativo: un errore previsto, con status, come nei service.
    // Non si lancia con throw: si passa a cb, e multer lo inoltra a errorHandler.
    // 415 = Unsupported Media Type, "questo formato non lo accetto".
    const error = new Error(
      "Formato non supportato: carica PDF, DOCX, TXT o MD",
    );
    error.status = 415;
    cb(error);
  }
};

// La macchina regolata, non ancora un middleware.
// - storage in memoria: il file arriva alla route come Buffer in req.file.buffer
// - limits: 10 MB al massimo e un solo file per richiesta.
//   Se un limite salta, multer passa a errorHandler un MulterError senza status:
//   lì viene tradotto (413 per la dimensione, 400 per gli altri casi).
// - fileFilter: la funzione qui sopra (forma abbreviata di fileFilter: fileFilter).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 10, files: 1 },
  fileFilter,
});

// Il middleware vero: un solo file, nel campo chiamato "file".
// Il nome è un contratto con il client: formData.append("file", …) e curl -F "file=@…".
// Se tutto va bene riempie req.file (originalname, mimetype, size, buffer) e chiama next().
export default upload.single("file");
