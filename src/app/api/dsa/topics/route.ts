import { NextRequest, NextResponse } from 'next/server';
import { DevTrackStore } from '@/lib/storage';

export async function GET() {
  try {
    const topics = DevTrackStore.getDSATopics();
    const patterns = DevTrackStore.getDSAPatterns();
    return NextResponse.json({ success: true, topics, patterns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Topic name is required' }, { status: 400 });
    }
    const topic = DevTrackStore.addDSATopic(body);
    return NextResponse.json({ success: true, topic });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Topic ID is required' }, { status: 400 });
    }
    DevTrackStore.deleteDSATopic(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
