// app/api/_diag/role/route.ts
// SECURITY: Diagnostic endpoint disabled in production
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'Diagnostic endpoint disabled for security' },
    { status: 403 }
  );
}
