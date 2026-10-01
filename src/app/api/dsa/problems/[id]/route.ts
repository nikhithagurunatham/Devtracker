import { NextRequest, NextResponse } from 'next/server';
import { DevTrackStore } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const problem = DevTrackStore.getProblemById(params.id);
    if (!problem) {
      return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = DevTrackStore.updateProblem(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, problem: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = DevTrackStore.deleteProblem(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Problem deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
