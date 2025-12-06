// lib/server/auth.ts
// Server-side authentication utilities

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * Verify that the request has a valid Supabase session
 * Returns the user if authenticated, or an error response if not
 */
export async function requireAuth(): Promise<
  { user: AuthenticatedUser } | { error: NextResponse }
> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
    };
  } catch (err) {
    console.error('[requireAuth] Error:', err);
    return {
      error: NextResponse.json(
        { error: 'Authentication check failed' },
        { status: 500 }
      ),
    };
  }
}
