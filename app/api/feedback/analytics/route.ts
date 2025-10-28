// =====================================================
// API Route: /app/api/feedback/analytics/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      projectId,
      eventType,
      questionNumber,
      metadata,
      userId
    } = body;

    // Validate event type
    const validEvents = [
      'modal_opened',
      'question_answered', 
      'form_completed',
      'form_abandoned'
    ];
    
    if (!validEvents.includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Insert analytics event
    const { error } = await supabase
      .from('feedback_analytics')
      .insert({
        project_id: projectId || null,
        user_id: userId || null,
        event_type: eventType,
        question_number: questionNumber,
        metadata: metadata || {}
      });

    if (error) {
      console.error('Analytics tracking error:', error);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint voor analytics dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') || '100';

    // Build query
    let query = supabase
      .from('feedback_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Calculate funnel metrics
    const funnel = calculateFunnelMetrics(data || []);

    return NextResponse.json({
      events: data,
      funnel,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function voor funnel metrics
function calculateFunnelMetrics(events: any[]) {
  const metrics = {
    modalOpened: 0,
    startedFilling: 0,
    reachedQuestion2: 0,
    reachedQuestion3: 0,
    reachedQuestion4: 0,
    completed: 0,
    abandoned: 0
  };

  events.forEach(event => {
    switch (event.event_type) {
      case 'modal_opened':
        metrics.modalOpened++;
        break;
      case 'question_answered':
        if (event.question_number === 1) metrics.startedFilling++;
        if (event.question_number === 2) metrics.reachedQuestion2++;
        if (event.question_number === 3) metrics.reachedQuestion3++;
        if (event.question_number === 4) metrics.reachedQuestion4++;
        break;
      case 'form_completed':
        metrics.completed++;
        break;
      case 'form_abandoned':
        metrics.abandoned++;
        break;
    }
  });

  // Calculate conversion rates
  const conversionRates = {
    startRate: metrics.modalOpened > 0 
      ? ((metrics.startedFilling / metrics.modalOpened) * 100).toFixed(1) 
      : '0',
    completionRate: metrics.startedFilling > 0 
      ? ((metrics.completed / metrics.startedFilling) * 100).toFixed(1) 
      : '0',
    abandonRate: metrics.modalOpened > 0 
      ? ((metrics.abandoned / metrics.modalOpened) * 100).toFixed(1) 
      : '0'
  };

  return {
    ...metrics,
    conversionRates
  };
}