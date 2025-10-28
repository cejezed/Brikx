// =====================================================
// API Route: /app/api/feedback/submit/route.ts
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server-side
);

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      projectId,
      npsScore,
      npsReason,
      ratings,
      feedback,
      allowTestimonial,
      testimonialName,
      wantsUpdates,
      contactEmail,
      timeToComplete,
      userId // Pass this from frontend if you have it
    } = body;

    // Insert feedback response
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback_responses')
      .insert({
        project_id: projectId,
        user_id: userId || null, // Can be null for anonymous feedback
        nps_score: npsScore,
        nps_reason: npsReason,
        rating_speed: ratings?.speed,
        rating_clarity: ratings?.clarity,
        rating_quality: ratings?.quality,
        rating_value: ratings?.value,
        rating_confidence: ratings?.confidence,
        feedback_best: feedback?.best,
        feedback_missing: feedback?.missing,
        feedback_frustrating: feedback?.frustrating,
        allow_testimonial: allowTestimonial || false,
        testimonial_name: testimonialName,
        wants_updates: wantsUpdates || false,
        contact_email: contactEmail,
        time_to_complete: timeToComplete,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Feedback insertion error:', feedbackError);
      return NextResponse.json(
        { error: 'Failed to save feedback', details: feedbackError },
        { status: 500 }
      );
    }

    // If user wants updates, add to early adopters list
    if (wantsUpdates && contactEmail) {
      const { error: adoptError } = await supabase
        .from('early_adopters')
        .upsert({
          email: contactEmail,
          name: testimonialName || null,
          source: 'feedback_form',
          feedback_id: feedbackData.id,
          has_premium: true
        }, {
          onConflict: 'email'
        });

      if (adoptError) {
        console.error('Early adopter error:', adoptError);
        // Don't fail the whole request for this
      }
    }

    // If testimonial allowed, create testimonial entry
    if (allowTestimonial && testimonialName && feedback?.best) {
      const quote = feedback.best.slice(0, 200);
      
      const { error: testimonialError } = await supabase
        .from('testimonials')
        .insert({
          feedback_id: feedbackData.id,
          quote: quote,
          author_name: testimonialName,
          author_role: `Beta Tester`,
          is_published: false // Admin moet eerst goedkeuren
        });

      if (testimonialError) {
        console.error('Testimonial error:', testimonialError);
        // Don't fail the whole request for this
      }
    }

    // Unlock premium for the project (if you have projects table)
    if (projectId) {
      const { error: projectError } = await supabase
        .from('projects')
        .update({ 
          tier: 'premium',
          premium_unlocked_at: new Date().toISOString(),
          premium_unlock_reason: 'beta_feedback'
        })
        .eq('id', projectId);

      if (projectError) {
        console.error('Project update error:', projectError);
        // This might fail if projects table doesn't exist yet
      }
    }

    // Optional: Send email notification
    if (process.env.SEND_EMAIL_NOTIFICATIONS === 'true') {
      await sendEmailNotification({
        npsScore,
        feedback: feedback?.best || 'No feedback',
        email: contactEmail
      });
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedbackData.id,
      message: 'Bedankt voor je feedback!'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional email notification
async function sendEmailNotification(data: any) {
  try {
    // Implement je eigen email logica hier
    // Of gebruik je existing email setup van human-handoff
    console.log('Email notification:', data);
  } catch (error) {
    console.error('Email error:', error);
  }
}