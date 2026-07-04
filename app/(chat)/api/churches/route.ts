import { auth } from '@/app/(auth)/auth';
import { createChurch, getChurches } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const churches = await getChurches();
  return Response.json(churches);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === 'guest') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, denomination, description, address, phone, schedule, pastor, members } = body;

  if (!name) {
    return Response.json({ error: 'name é obrigatório' }, { status: 400 });
  }

  const created = await createChurch({
    name,
    denomination,
    description,
    address,
    phone,
    schedule,
    pastor,
    members: members ? Number(members) : undefined,
    adminUserId: session.user.id,
  });

  return Response.json(created, { status: 201 });
}
