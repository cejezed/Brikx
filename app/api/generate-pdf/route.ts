// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { createElement } from 'react';
import { PveTemplate } from '@/lib/pdf/PveTemplate';
import type { DocumentStatus } from '@/app/wizard/components/DossierChecklist';

interface GeneratePdfRequest {
  // ✅ FIX: Match your actual wizard state structure
  chapterAnswers?: Record<string, any>;
  isPremium?: boolean;
  documentStatus?: DocumentStatus | null;
  email?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GeneratePdfRequest = await req.json();
    const { 
      chapterAnswers, 
      isPremium = false, 
      documentStatus = null,
      email
    } = body;

    if (!chapterAnswers) {
      return NextResponse.json(
        { error: 'Missing data', message: 'chapterAnswers data is required' },
        { status: 400 }
      );
    }

    console.log('[PDF Generation] Starting...', {
      isPremium,
      hasChapters: !!chapterAnswers,
      hasDocumentStatus: !!documentStatus,
      email: email ? '***' : undefined,
    });

    // ✅ FIX: Pass your wizard data structure to PveTemplate
    const pdfDocument = createElement(PveTemplate, { 
      data: chapterAnswers,
      isPremium: isPremium,
      documentStatus: documentStatus || undefined,
    });
    
    const stream = await renderToStream(pdfDocument);

    const timestamp = new Date().toISOString().split('T')[0];
    const projectName = chapterAnswers.basis?.projectNaam || 'Mijn PvE';
    const filename = `pve-${projectName}-${timestamp}.pdf`;

    console.log('[PDF Generation] Success!', { filename, isPremium });

    if (email) {
      sendPdfEmail(email, projectName, isPremium)
        .catch(err => console.error('[Email Send] Failed:', err));
    }

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        'Content-Transfer-Encoding': 'binary',
      },
    });

  } catch (error: any) {
    console.error('[PDF Generation] Failed:', error);
    
    return NextResponse.json(
      { 
        error: 'PDF_GENERATION_FAILED',
        message: error?.message || 'Failed to generate PDF',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/generate-pdf',
    method: 'POST',
    requiredFields: ['chapterAnswers'],
    optionalFields: ['isPremium', 'documentStatus', 'email'],
    example: {
      chapterAnswers: {
        basis: { projectNaam: 'Villa Dijk', locatie: 'Amsterdam' },
        wensen: ['Veel licht', 'Open keuken'],
        ruimtes: [{ naam: 'Woonkamer', oppervlakte: 40 }],
        budget: { bedrag: 250000 },
      },
      isPremium: true,
    },
  });
}

async function sendPdfEmail(
  email: string,
  projectName: string,
  isPremium: boolean
): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/send-pdf-email`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          projectName,
          isPremium,
        }),
      }
    );

    if (!response.ok) {
      console.error('[Email Send] Failed with status:', response.status);
      return;
    }

    console.log('[Email Send] Success to:', email);
  } catch (error) {
    console.error('[Email Send] Error:', error);
  }
}