import { auth } from '@/app/(auth)/auth';
import { getCommunityMembers } from '@/lib/db/queries';
import { getTestimonialsByUsers } from '@/lib/db/queries/testimonials';

/** GET /api/communities/[id]/feed
 *  Retorna os testemunhos mais recentes dos membros desta comunidade. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const members = await getCommunityMembers(id);
  const userIds = members.map((m) => m.userId).filter(Boolean) as string[];

  const posts = await getTestimonialsByUsers(userIds);
  return Response.json(posts);
}
