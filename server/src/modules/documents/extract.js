import { extname } from "node:path";
import { getDocumentProxy, extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";

export async function extractText(buffer, filename) {
  const extension = extname(filename).toLowerCase();
  if (extension === ".txt" || extension === ".md") {
    const text = buffer.toString("utf-8");
    return text;
  }

  if (extension === ".pdf") {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractPdfText(pdf, {
        mergePages: true,
      });
      return text;
    } catch {
      const error = new Error(
        "Impossibile leggere il file: potrebbe essere danneggiato o non essere del formato indicato",
      );
      error.status = 422;
      throw error;
    }
  }

  if (extension === ".docx") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch {
      const error = new Error(
        "Impossibile leggere il file: potrebbe essere danneggiato o non essere del formato indicato",
      );
      error.status = 422;
      throw error;
    }
  }

  const error = new Error("Formato non supportato: carica PDF, DOCX, TXT o MD");
  error.status = 415;
  throw error;
}
