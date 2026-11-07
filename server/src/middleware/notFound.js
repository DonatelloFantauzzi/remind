export default function notFound(req, res, next) {
  const error = new Error("Percorso non trovato");
  error.status = 404;
  throw error;
}
