import { auth } from '@/app/(auth)/auth';
import { getMyPrayerGroupIds, joinPrayerGroup, leavePrayerGroup } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/prayer-groups/[id]/join — toggle entrar/sair
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: groupId } = await params;
  const myIds = await getMyPrayerGroupIds(session.user.id);
  const isJoined = myIds.includes(groupId);

  if (isJoined) {
    await leavePrayerGroup(groupId, session.user.id);
    return Response.json({ joined: false });
  } else {
    await joinPrayerGroup(groupId, session.user.id);
    return Response.json({ joined: true });
  }
}
