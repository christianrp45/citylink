import { auth } from '@/app/(auth)/auth';
import { toggleTestimonialLike } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/testimonials/[id]/like — toggle emoji reaction
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const emoji: string = body?.emoji ?? '❤️';

  const result = await toggleTestimonialLike(id, session.user.id, emoji);
  return Response.json(result);
}
