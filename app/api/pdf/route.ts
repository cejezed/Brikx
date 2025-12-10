import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pdf
 *
 * Placeholder endpoint voor PDF generatie.
 * TODO: Implementeer daadwerkelijke PDF generatie met @react-pdf/renderer of puppeteer
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wizardState } = body;

    // TODO: Implementeer PDF generatie
    // Voor nu: return een foutmelding dat de feature nog niet beschikbaar is

    return NextResponse.json(
      {
        error: 'PDF export is nog niet geïmplementeerd',
        message: 'Deze functie is in ontwikkeling. Gebruik voorlopig JSON export via de export modal.'
      },
      { status: 501 } // Not Implemented
    );

    // Toekomstige implementatie zou er zo uit kunnen zien:
    // const pdfBuffer = await generatePvePdf(wizardState);
    // return new NextResponse(pdfBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': 'attachment; filename="Brikx-PvE.pdf"',
    //   },
    // });
  } catch (error: any) {
    console.error('[API /pdf] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    );
  }
}
