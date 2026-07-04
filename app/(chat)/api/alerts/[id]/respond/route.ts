import { auth } from '@/app/(auth)/auth';
import { respondToAlert } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// POST /api/alerts/[id]/respond — "Posso Ajudar!"
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: alertId } = await params;
  await respondToAlert(alertId, session.user.id);
  return Response.json({ ok: true });
}
