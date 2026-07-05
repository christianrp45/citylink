import { auth } from '@/app/(auth)/auth';
import {
  createAlert,
  getAlerts,
  getAcceptedFriendIds,
  getAllPushSubscriptionsForUsers,
  deletePushSubscription,
} from '@/lib/db/queries';
import { sendPush } from '@/lib/push';
import { NextRequest } from 'next/server';

const ALERT_PUSH: Record<string, { title: string; body: (desc: string, name: string) => string }> = {
  urgency: {
    title: '🚨 Pedido de ajuda urgente',
    body: (desc, name) => `${name}: ${desc.slice(0, 80)}`,
  },
  prayer: {
    title: '🙏 Pedido de oração',
    body: (desc, name) => `${name} pede oração: ${desc.slice(0, 70)}`,
  },
  practical_help: {
    title: '🤝 Pedido de ajuda prática',
    body: (desc, name) => `${name}: ${desc.slice(0, 80)}`,
  },
};

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

  // Notificar amigos aceitos (fire-and-forget)
  const senderName = session.user.name ?? session.user.email?.split('@')[0] ?? 'Alguém';
  const pushCfg = ALERT_PUSH[type];
  if (pushCfg) {
    const friendIds = await getAcceptedFriendIds(session.user.id);
    if (friendIds.length > 0) {
      const subs = await getAllPushSubscriptionsForUsers(friendIds);
      await Promise.all(
        subs.map(async (sub) => {
          const ok = await sendPush(sub, {
            title: pushCfg.title,
            body: pushCfg.body(description, senderName),
            url: '/map',
          });
          if (!ok) await deletePushSubscription(sub.endpoint);
        })
      );
    }
  }

  return Response.json(created, { status: 201 });
}
