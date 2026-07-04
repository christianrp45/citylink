import { auth } from '@/app/(auth)/auth';
import {
  createVolunteerOpportunity,
  getMyEnrollmentIds,
  getVolunteerEnrollmentCounts,
  getVolunteerOpportunities,
} from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [opportunities, myIds] = await Promise.all([
    getVolunteerOpportunities(),
    getMyEnrollmentIds(session.user.id),
  ]);

  const ids = opportunities.map((o) => o.id);
  const counts = await getVolunteerEnrollmentCounts(ids);
  const myIdSet = new Set(myIds);

  return Response.json(
    opportunities.map((o) => ({
      ...o,
      enrolled: counts[o.id] ?? 0,
      isEnrolled: myIdSet.has(o.id),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, category, address, date, spots, organizerName } = body;

  if (!title || !date) {
    return Response.json({ error: 'title e date são obrigatórios' }, { status: 400 });
  }

  const created = await createVolunteerOpportunity({
    title,
    description,
    category,
    address,
    date: new Date(date),
    spots: spots ? Number(spots) : 10,
    organizerName,
    creatorId: session.user.id,
  });

  return Response.json(created, { status: 201 });
}
