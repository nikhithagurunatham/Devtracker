import { NextRequest, NextResponse } from 'next/server';
import { DevTrackStore } from '@/lib/storage';

export async function GET() {
  try {
    const plan = DevTrackStore.getDailyPlan();
    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan } = body;
    if (Array.isArray(plan)) {
      DevTrackStore.setDailyPlan(plan);
      return NextResponse.json({ success: true, plan });
    }
    return NextResponse.json({ success: false, error: 'Invalid plan array' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
