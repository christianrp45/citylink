import { auth } from '@/app/(auth)/auth';
import {
  getBusinessRecommendations,
  toggleBusinessRecommendation,
  getUserCommunityRole,
} from '@/lib/db/queries';

// GET /api/communities/[id]/recommend — lista de recomendadores (só membro aprovado)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const myRole = await getUserCommunityRole(id, session.user.id);
  if (!myRole?.approvedAt) {
    return Response.json({ error: 'Você não faz parte desta comunidade' }, { status: 403 });
  }

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
  const myRole = await getUserCommunityRole(id, session.user.id);
  if (!myRole?.approvedAt) {
    return Response.json({ error: 'Você não faz parte desta comunidade' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const comment = typeof body.comment === 'string' ? body.comment.trim() || undefined : undefined;

  const result = await toggleBusinessRecommendation(id, session.user.id, comment);
  return Response.json(result);
}
