import webpush from 'web-push';

// Configuração VAPID — define uma vez, reutiliza em todas as rotas
if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export { webpush };

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
};

/**
 * Envia notificação push para uma subscription.
 * Retorna false se a subscription expirou (410) para que seja removida do banco.
 */
export async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      return false; // subscription expirada
    }
    console.error('[push] sendNotification error:', err?.statusCode, err?.message);
    return true; // erro transitório, não remover
  }
}
