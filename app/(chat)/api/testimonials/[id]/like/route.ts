import { auth } from '@/app/(auth)/auth';
import { toggleTestimonialLike } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/testimonials/[id]/like — toggle like
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const liked = await toggleTestimonialLike(id, session.user.id);
  return Response.json({ liked });
}
