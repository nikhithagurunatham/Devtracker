import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DevTrackStore } from '@/lib/storage';

const createProblemSchema = z.object({
  topicId: z.string(),
  topicName: z.string().optional(),
  name: z.string().min(1, 'Problem name is required'),
  platform: z.string().default('LeetCode'),
  url: z.string().url('Must be valid URL'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  patterns: z.array(z.string()).default([]),
  companyTags: z.array(z.string()).default([]),
  frequency: z.number().int().min(1).max(10).default(5),
  status: z.enum(['NOT_STARTED', 'ATTEMPTED', 'HINT_USED', 'SOLVED', 'MASTERED']).default('NOT_STARTED'),
  confidence: z.number().int().min(1).max(5).default(3),
  timeTakenMin: z.number().optional(),
  solutionNotes: z.string().optional(),
  codeSnippet: z.string().optional(),
  mistakes: z.string().optional(),
  nextRevisionAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');
    const weakOnly = searchParams.get('weakOnly') === 'true';
    const random = searchParams.get('random') === 'true';

    if (random) {
      const randomProblem = DevTrackStore.getRandomWeakProblem();
      return NextResponse.json({ success: true, problem: randomProblem });
    }

    let problems = DevTrackStore.getProblems();
    if (topicId) problems = problems.filter((p) => p.topicId === topicId);
    if (difficulty) problems = problems.filter((p) => p.difficulty === difficulty);
    if (status) problems = problems.filter((p) => p.status === status);
    if (weakOnly) problems = problems.filter((p) => p.confidence <= 2 || p.status === 'ATTEMPTED');

    return NextResponse.json({ success: true, problems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createProblemSchema.parse(body);
    const problem = DevTrackStore.addProblem(validated as any);
    return NextResponse.json({ success: true, problem }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
