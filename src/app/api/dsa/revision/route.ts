import { NextRequest, NextResponse } from 'next/server';
import { DevTrackStore } from '@/lib/storage';
import { calculateNextRevision } from '@/lib/spaced-repetition';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const problems = DevTrackStore.getProblems();
    const due = problems.filter((p) => p.nextRevisionAt && p.nextRevisionAt <= today);

    return NextResponse.json({
      success: true,
      dueCount: due.length,
      problems: due,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, confidence } = body;

    if (!problemId || confidence === undefined) {
      return NextResponse.json(
        { success: false, error: 'problemId and confidence (1-5) required' },
        { status: 400 }
      );
    }

    const problem = DevTrackStore.getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ success: false, error: 'Problem not found' }, { status: 404 });
    }

    const sr = calculateNextRevision(confidence, problem.attemptsCount);
    const updated = DevTrackStore.updateProblem(problemId, {
      confidence,
      status: confidence >= 4 ? 'MASTERED' : 'SOLVED',
      nextRevisionAt: sr.nextRevisionDate,
    });

    return NextResponse.json({
      success: true,
      problem: updated,
      spacedRepetition: sr,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
