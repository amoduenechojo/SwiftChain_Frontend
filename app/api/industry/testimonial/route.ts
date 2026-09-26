// DEV-ONLY DEMO ROUTE — delete before opening the PR.
// This stands in for the real backend so the testimonial block renders with data on localhost.
import { NextResponse } from 'next/server';
import type { Testimonial } from '@/types/testimonial';

const fixture: Testimonial = {
  id: 't1',
  quote:
    "SwiftChain cut our cross-border settlement time from five days to under an hour. The escrow multi-sig flow gave our finance team the confidence to move volume they'd never trusted to a single platform before.",
  authorName: 'Sarah Chen',
  authorRole: 'VP of Operations',
  authorCompany: 'Meridian Logistics',
};

export async function GET() {
  return NextResponse.json(fixture);
}
