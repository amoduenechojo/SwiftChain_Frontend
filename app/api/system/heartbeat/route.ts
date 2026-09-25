// DEV-ONLY DEMO ROUTE — delete before opening the PR.
// Stands in for a real backend health-check endpoint so the offline
// detector can verify actual reachability, not just navigator.onLine.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}
