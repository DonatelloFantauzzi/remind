import multer from "multer";

export default function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      err.status = 413;
      err.message = "Il file supera il limite di 10 MB";
    } else {
      err.status = 400;
      err.message = "Caricamento non valido: invia un solo file nel campo file";
    }
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Oops..qualcosa è andato storto" });
}
