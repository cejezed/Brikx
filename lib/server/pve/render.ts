import { chromium as playwrightChromium } from "playwright-core";
import chromium from "@sparticuz/chromium";
import { PDFDocument } from "pdf-lib";
import { buildPveExportModel, type PveExportModel } from "./exportModel";
import { renderBodyHtml, renderCoverHtml, renderFooterTemplate, renderHeaderTemplate } from "./template";

export type RenderPdfInput = {
  chapterAnswers?: Record<string, any>;
  triage?: Record<string, any>;
  projectName?: string;
};

async function renderWithChromium(html: string, opts: { headerTemplate?: string; footerTemplate?: string; withHeaderFooter?: boolean }) {
  const browser = await playwrightChromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 1800 },
    });

    await page.setContent(html, { waitUntil: "networkidle" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: !!opts.withHeaderFooter,
      headerTemplate: opts.headerTemplate,
      footerTemplate: opts.footerTemplate,
      margin: opts.withHeaderFooter
        ? { top: "100px", bottom: "72px", left: "36px", right: "36px" }
        : { top: "0px", bottom: "0px", left: "0px", right: "0px" },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close().catch(() => undefined);
  }
}

export async function renderPvePdfBuffer(input: RenderPdfInput): Promise<Buffer> {
  const model: PveExportModel = buildPveExportModel(input);
  const coverHtml = renderCoverHtml(model);
  const bodyHtml = renderBodyHtml(model);
  const headerTemplate = renderHeaderTemplate(model);
  const footerTemplate = renderFooterTemplate();

  const [coverBuffer, bodyBuffer] = await Promise.all([
    renderWithChromium(coverHtml, { withHeaderFooter: false }),
    renderWithChromium(bodyHtml, {
      withHeaderFooter: true,
      headerTemplate,
      footerTemplate,
    }),
  ]);

  // Merge cover + body
  const merged = await PDFDocument.create();
  const coverDoc = await PDFDocument.load(coverBuffer);
  const bodyDoc = await PDFDocument.load(bodyBuffer);

  const [coverPage] = await merged.copyPages(coverDoc, coverDoc.getPageIndices());
  merged.addPage(coverPage);

  const bodyPages = await merged.copyPages(bodyDoc, bodyDoc.getPageIndices());
  for (const p of bodyPages) merged.addPage(p);

  const finalBuffer = await merged.save();
  return Buffer.from(finalBuffer);
}
