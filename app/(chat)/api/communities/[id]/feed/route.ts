import { auth } from '@/app/(auth)/auth';
import { getCommunityMembers, getUserCommunityRole } from '@/lib/db/queries';
import { getTestimonialsByUsers } from '@/lib/db/queries/testimonials';

/** GET /api/communities/[id]/feed
 *  Retorna os testemunhos mais recentes dos membros desta comunidade
 *  (só pra quem já é membro aprovado). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const myRole = await getUserCommunityRole(id, session.user.id);
  if (!myRole?.approvedAt) {
    return Response.json({ error: 'Você não faz parte desta comunidade' }, { status: 403 });
  }

  const members = await getCommunityMembers(id);
  const userIds = members.map((m) => m.userId).filter(Boolean) as string[];

  const posts = await getTestimonialsByUsers(userIds);
  return Response.json(posts);
}
