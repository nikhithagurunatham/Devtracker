import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, mode, isWebSearch } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const result = await AIService.chat(message, mode, !!isWebSearch);
    return NextResponse.json({
      success: true,
      response: result.response,
      source: result.source,
      contextSummary: result.contextSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
