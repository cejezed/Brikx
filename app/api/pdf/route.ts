import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { PveTemplate } from '@/lib/pdf/PveTemplate';
import React from 'react';

/**
 * POST /api/pdf
 *
 * Generates a PDF from the wizard state using PveTemplate
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wizardState } = body;

    if (!wizardState || !wizardState.chapterAnswers) {
      return NextResponse.json(
        { error: 'Geen wizard data beschikbaar voor PDF generatie' },
        { status: 400 }
      );
    }

    // Transform wizardState.chapterAnswers to match PveTemplate data structure
    const pdfData = {
      triage: wizardState.chapterAnswers?.basis,
      basis: wizardState.chapterAnswers?.basis,
      wensen: wizardState.chapterAnswers?.wensen,
      budget: wizardState.chapterAnswers?.budget,
      ruimtes: wizardState.chapterAnswers?.ruimtes,
      techniek: wizardState.chapterAnswers?.techniek,
      duurzaamheid: wizardState.chapterAnswers?.duurzaam,
      risico: wizardState.chapterAnswers?.risico,
    };

    const isPremium = wizardState.mode === 'PREMIUM';

    // Generate PDF buffer using PveTemplate
    const pdfBuffer = await renderToBuffer(
      React.createElement(PveTemplate, {
        data: pdfData,
        isPremium,
        documentStatus: null
      }) as any  // Type workaround for React PDF
    );

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Brikx-PvE.pdf"',
      },
    });
  } catch (error: any) {
    console.error('[API /pdf] Error:', error);
    return NextResponse.json(
      { error: 'PDF generatie mislukt', message: error?.message },
      { status: 500 }
    );
  }
}
