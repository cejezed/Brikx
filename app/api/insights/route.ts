// app/api/insights/route.ts
// API endpoint voor ExpertCorner insights

import { NextRequest, NextResponse } from 'next/server';
import { InsightGenerator } from '@/lib/insights/InsightGenerator';
import { InsightsRequestSchema } from '@/lib/validation/api-schemas';
import type { InsightContext } from '@/lib/insights/types';

export const runtime = 'nodejs'; // Voor OpenAI SDK compatibility

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // SECURITY: Validate input with Zod
    const validation = InsightsRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { context } = validation.data;

    // Generate insights
    const generator = new InsightGenerator();
    const response = await generator.generate(context);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Insights API error:', error);

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'insights',
    timestamp: new Date().toISOString()
  });
}
