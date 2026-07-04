import { auth } from '@/app/(auth)/auth';
import { joinEvent, leaveEvent, getMyEventIds } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/events/[id]/join — toggle: join if not joined, leave if already joined
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: eventId } = await params;
  const myIds = await getMyEventIds(session.user.id);
  const isJoined = myIds.includes(eventId);

  if (isJoined) {
    await leaveEvent(eventId, session.user.id);
    return Response.json({ joined: false });
  } else {
    await joinEvent(eventId, session.user.id);
    return Response.json({ joined: true });
  }
}
