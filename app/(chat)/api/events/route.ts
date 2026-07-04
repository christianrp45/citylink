import { auth } from '@/app/(auth)/auth';
import { createEvent, getEvents, getMyEventIds } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [events, myIds] = await Promise.all([
    getEvents(),
    getMyEventIds(session.user.id),
  ]);

  const myIdSet = new Set(myIds);
  const result = events.map((e) => ({ ...e, isJoined: myIdSet.has(e.id) }));
  return Response.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, type, address, lat, lng, date } = body;

  if (!title || !type || !date) {
    return Response.json({ error: 'title, type e date são obrigatórios' }, { status: 400 });
  }

  const validTypes = ['social', 'religious', 'volunteer', 'business'];
  if (!validTypes.includes(type)) {
    return Response.json({ error: 'Tipo inválido' }, { status: 400 });
  }

  const created = await createEvent({
    title,
    description,
    type,
    address,
    lat,
    lng,
    date: new Date(date),
    organizerId: session.user.id,
  });

  return Response.json(created, { status: 201 });
}
