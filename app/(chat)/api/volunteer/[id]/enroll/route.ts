import { auth } from '@/app/(auth)/auth';
import { enrollVolunteer, getMyEnrollmentIds, unenrollVolunteer } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/volunteer/[id]/enroll — toggle inscrição
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: opportunityId } = await params;
  const myIds = await getMyEnrollmentIds(session.user.id);
  const isEnrolled = myIds.includes(opportunityId);

  if (isEnrolled) {
    await unenrollVolunteer(opportunityId, session.user.id);
    return Response.json({ enrolled: false });
  } else {
    await enrollVolunteer(opportunityId, session.user.id);
    return Response.json({ enrolled: true });
  }
}
