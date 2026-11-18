import { extname } from "node:path";

export async function extractText(buffer, filename) {
  const extension = extname(filename).toLowerCase();
  if (extension === ".txt" || extension === ".md") {
    const text = buffer.toString("utf-8");
    return text;
  } else {
    const error = new Error("Per ora sono supportati solo TXT e MD");
    error.status = 415;
    throw error;
  }
}
