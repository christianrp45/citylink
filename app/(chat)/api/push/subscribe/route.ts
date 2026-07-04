import { auth } from '@/app/(auth)/auth';
import {
  deletePushSubscription,
  getUserPushSubscriptions,
  savePushSubscription,
} from '@/lib/db/queries';
import { NextRequest } from 'next/server';

// GET — retorna a chave pública VAPID para o cliente subscrever
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return Response.json(
      { error: 'Push notifications não configuradas (VAPID_PUBLIC_KEY ausente)' },
      { status: 503 }
    );
  }
  return Response.json({ publicKey });
}

// POST — salva uma nova PushSubscription do dispositivo
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: 'Dados de subscription inválidos' }, { status: 400 });
  }

  await savePushSubscription(
    session.user.id,
    endpoint,
    keys.p256dh,
    keys.auth
  );

  return Response.json({ ok: true }, { status: 201 });
}

// DELETE — remove subscription (usuário revogou permissão)
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { endpoint } = await req.json();
  if (!endpoint) {
    return Response.json({ error: 'endpoint obrigatório' }, { status: 400 });
  }

  // Verifica que a subscription pertence ao usuário antes de deletar
  const subs = await getUserPushSubscriptions(session.user.id);
  const owns = subs.some((s) => s.endpoint === endpoint);
  if (!owns) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  await deletePushSubscription(endpoint);
  return Response.json({ ok: true });
}
