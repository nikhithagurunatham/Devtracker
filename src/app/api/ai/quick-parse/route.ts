import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ success: false, error: 'Input text is required' }, { status: 400 });
    }

    const parsed = AIService.parseQuickAction(input);
    return NextResponse.json({ success: true, parsed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
