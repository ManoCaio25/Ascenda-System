// docxText.js — extract raw text from DOCX in the browser
// Requirements: `mammoth`
// npm i mammoth

import * as mammoth from "mammoth";

export async function extractDocxText(file) {
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return (value || "").trim();
}
