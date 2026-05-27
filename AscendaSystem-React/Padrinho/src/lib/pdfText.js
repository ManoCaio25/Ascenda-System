// pdfText.js — extract visible text from PDF in the browser
// Requirements: `pdfjs-dist`
// npm i pdfjs-dist

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text.replace(/\s+\n/g, "\n").trim();
}
