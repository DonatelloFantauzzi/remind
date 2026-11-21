// server/src/modules/documents/chunk.js
// Divide il testo di un documento in pezzi sovrapposti, ognuno con la sua posizione nel testo intero.
// Lo chiama il worker (src/jobs/worker.js). Non tocca il database.

// Dimensioni in caratteri: da rivedere nella fase 4, con il modello di embedding.
const chunkSize = 1500;
const chunkOverlap = 200;

export function chunkText(text) {
  let start = 0;
  const chunks = [];

  while (start < text.length) {
    const limit = Math.min(start + chunkSize, text.length);
    let end = limit;
    if (limit < text.length) {
      const middle = start + chunkSize / 2;
      const paragraphBreak = text.lastIndexOf("\n\n", limit);
      if (paragraphBreak > middle) {
        end = paragraphBreak + 2;
      } else {
        const spaceBreak = text.lastIndexOf(" ", limit);
        if (spaceBreak > middle) {
          end = spaceBreak + 1;
        }
      }
    }
    chunks.push({
      chunkIndex: chunks.length,
      startOffset: start,
      endOffset: end,
      content: text.slice(start, end),
    });

    if (end === text.length) break;

    let nextStart = end - chunkOverlap;
    const spaceAfter = text.indexOf(" ", nextStart);
    if (spaceAfter !== -1 && spaceAfter < end) {
      nextStart = spaceAfter + 1;
    }

    start = nextStart;
  }

  return chunks;
}
