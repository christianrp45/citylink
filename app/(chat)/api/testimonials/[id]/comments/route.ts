import { auth } from '@/app/(auth)/auth';
import { addTestimonialComment } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/testimonials/[id]/comments — adicionar comentário
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: testimonialId } = await params;
  const { content } = await req.json();

  if (!content || typeof content !== 'string' || !content.trim()) {
    return Response.json({ error: 'content é obrigatório' }, { status: 400 });
  }

  const comment = await addTestimonialComment({
    testimonialId,
    userId: session.user.id,
    content: content.trim(),
  });

  return Response.json(comment, { status: 201 });
}
