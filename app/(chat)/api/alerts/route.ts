import { auth } from '@/app/(auth)/auth';
import { createAlert, getAlerts } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  const alerts = await getAlerts(
    lat ? parseFloat(lat) : undefined,
    lng ? parseFloat(lng) : undefined
  );

  return Response.json(alerts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { type, description, lat, lng } = body;

  if (!type || !description) {
    return Response.json({ error: 'type e description são obrigatórios' }, { status: 400 });
  }

  const validTypes = ['urgency', 'prayer', 'practical_help'];
  if (!validTypes.includes(type)) {
    return Response.json({ error: 'Tipo inválido' }, { status: 400 });
  }

  const created = await createAlert({
    userId: session.user.id,
    type,
    description,
    lat,
    lng,
  });

  return Response.json(created, { status: 201 });
}
