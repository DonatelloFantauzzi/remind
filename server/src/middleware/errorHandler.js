export default function errorHandler(err, req, res, next) {
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Oops..qualcosa è andato storto" });
}
