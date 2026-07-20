import { auth } from '@/app/(auth)/auth';
import { createTestimonial, getTestimonials } from '@/lib/db/queries';
import { NextRequest } from 'next/server';
import { awardPoints } from '@/lib/gamification';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const items = await getTestimonials();
  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content } = await req.json();
  if (!title || !content) {
    return Response.json({ error: 'title e content são obrigatórios' }, { status: 400 });
  }

  const created = await createTestimonial({
    userId: session.user.id,
    title,
    content,
  });

  void awardPoints(session.user.id, "share_testimony");

  return Response.json(created, { status: 201 });
}
