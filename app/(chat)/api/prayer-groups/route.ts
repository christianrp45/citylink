import { auth } from '@/app/(auth)/auth';
import { createPrayerGroup, getMyPrayerGroupIds, getPrayerGroups } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [groups, myIds] = await Promise.all([
    getPrayerGroups(),
    getMyPrayerGroupIds(session.user.id),
  ]);

  const myIdSet = new Set(myIds);
  return Response.json(groups.map((g) => ({ ...g, isJoined: myIdSet.has(g.id) })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, schedule, topic, isOnline } = await req.json();
  if (!name) {
    return Response.json({ error: 'name é obrigatório' }, { status: 400 });
  }

  const created = await createPrayerGroup({
    name,
    description,
    schedule,
    topic,
    isOnline: Boolean(isOnline),
    creatorId: session.user.id,
  });

  return Response.json(created, { status: 201 });
}
