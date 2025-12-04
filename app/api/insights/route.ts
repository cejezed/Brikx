// app/api/insights/route.ts
// API endpoint voor ExpertCorner insights

import { NextRequest, NextResponse } from 'next/server';
import { InsightGenerator } from '@/lib/insights/InsightGenerator';
import type { InsightContext } from '@/lib/insights/types';

export const runtime = 'nodejs'; // Voor OpenAI SDK compatibility

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context } = body as { context: InsightContext };

    // Validation
    if (!context || !context.currentChapter) {
      return NextResponse.json(
        { error: 'Missing context.currentChapter' },
        { status: 400 }
      );
    }

    if (!context.chapterAnswers) {
      return NextResponse.json(
        { error: 'Missing context.chapterAnswers' },
        { status: 400 }
      );
    }

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
