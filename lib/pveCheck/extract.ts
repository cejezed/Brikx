// lib/pveCheck/extract.ts — PDF/DOCX text extraction (Node.js runtime)
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import type { PveExtractResult } from "@/types/pveCheck";

const require = createRequire(import.meta.url);

// ============================================================================
// LIMITS
// ============================================================================

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 40;
const MAX_WORDS = 35_000;
const SCANNED_PDF_THRESHOLD = 50; // words/page

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// ============================================================================
// TEXT NORMALIZATION (v5.1 exact spec)
// ============================================================================

/**
 * Normalize text for reproducible hashing:
 * 1. \r\n → \n
 * 2. Collapse multiple spaces/tabs → single space
 * 3. Collapse multiple newlines → single newline
 * 4. Trim start/end
 */
function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// ============================================================================
// MAGIC BYTES DETECTION
// ============================================================================

function detectType(
  buffer: Buffer,
  fallbackMime: string,
): "pdf" | "docx" | "unsupported" {
  // PDF: starts with %PDF
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString("utf8") === "%PDF") {
    return "pdf";
  }
  // DOCX (ZIP): starts with PK\x03\x04
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return "docx";
  }
  // Fallback on MIME
  if (fallbackMime === "application/pdf") return "pdf";
  if (
    fallbackMime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  return "unsupported";
}

// ============================================================================
// PDF EXTRACTION (with per-page text)
// ============================================================================

type PdfPage = { pageIndex: number; pageContent: string };

async function extractPdf(
  buffer: Buffer,
): Promise<{ text: string; pageCount: number; pages: string[] }> {
  const pdfParse = require("pdf-parse") as (
    payload: Buffer,
    options?: { pagerender?: (pageData: PdfPage) => string },
  ) => Promise<{ text?: string; numpages?: number }>;

  const pageTexts: string[] = [];

  const result = await pdfParse(buffer, {
    pagerender: (pageData: PdfPage) => {
      const content =
        typeof pageData.pageContent === "string" ? pageData.pageContent : "";
      pageTexts.push(content);
      return content;
    },
  });

  // If pagerender didn't fire, fall back to splitting on form-feeds
  if (pageTexts.length === 0 && result.text) {
    const split = result.text.split("\f");
    for (const chunk of split) {
      pageTexts.push(chunk);
    }
  }

  return {
    text: result.text ?? "",
    pageCount: result.numpages ?? pageTexts.length,
    pages: pageTexts,
  };
}

// ============================================================================
// DOCX EXTRACTION
// ============================================================================

async function extractDocx(
  buffer: Buffer,
): Promise<{ text: string; pages: string[] }> {
  const mammoth = require("mammoth") as {
    extractRawText: (options: {
      buffer: Buffer;
    }) => Promise<{ value?: string }>;
  };
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value ?? "";
  // DOCX has no native page concept → single "page"
  return { text, pages: [text] };
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function extractDocument(file: File): Promise<PveExtractResult> {
  if (!file) throw new Error("No file provided");

  // Size check
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Bestand is te groot (max 10 MB)");
  }

  // MIME check
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Alleen PDF en DOCX zijn toegestaan");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Magic bytes check
  const detectedType = detectType(buffer, file.type);
  if (detectedType === "unsupported") {
    throw new Error("Bestandstype wordt niet ondersteund");
  }

  let rawText: string;
  let pageCount: number;
  let pages: string[];

  if (detectedType === "pdf") {
    const pdfResult = await extractPdf(buffer);
    rawText = pdfResult.text;
    pageCount = pdfResult.pageCount;
    pages = pdfResult.pages;
  } else {
    const docxResult = await extractDocx(buffer);
    rawText = docxResult.text;
    pageCount = 1;
    pages = docxResult.pages;
  }

  // Normalize for hashing
  const text = normalizeText(rawText);
  if (!text) {
    throw new Error("Geen bruikbare tekst gevonden in document");
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Page limit
  if (pageCount > MAX_PAGES) {
    throw new Error(`Document heeft ${pageCount} pagina's (max ${MAX_PAGES})`);
  }

  // Word limit
  if (wordCount > MAX_WORDS) {
    throw new Error(
      `Document heeft ${wordCount} woorden (max ${MAX_WORDS.toLocaleString("nl-NL")})`,
    );
  }

  // Scanned PDF detection
  if (
    detectedType === "pdf" &&
    pageCount > 0 &&
    wordCount / pageCount < SCANNED_PDF_THRESHOLD
  ) {
    throw new Error(
      "Dit lijkt een gescand document zonder leesbare tekst. Upload een digitale PDF of DOCX.",
    );
  }

  const textHash = sha256(text);

  // Normalize per-page text too
  const normalizedPages = pages.map((p) => normalizeText(p));

  return {
    text,
    textHash,
    pageCount,
    wordCount,
    format: detectedType,
    pages: normalizedPages,
    documentName: file.name || "document",
    mime: file.type,
  };
}
