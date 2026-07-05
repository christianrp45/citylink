import { auth } from '@/app/(auth)/auth';
import {
  getBusinessRecommendations,
  toggleBusinessRecommendation,
} from '@/lib/db/queries';

// GET /api/communities/[id]/recommend — lista de recomendadores
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const recs = await getBusinessRecommendations(id);
  return Response.json(recs);
}

// POST /api/communities/[id]/recommend — toggle (adicionar ou remover)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const comment = typeof body.comment === 'string' ? body.comment.trim() || undefined : undefined;

  const result = await toggleBusinessRecommendation(id, session.user.id, comment);
  return Response.json(result);
}
