import { auth } from "@/app/(auth)/auth";
import { getCellMessages, createCellMessage, getCellMembers, getAllPushSubscriptionsForUsers, deletePushSubscription } from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

// GET /api/mdc/cells/[cellId]/chat — busca mensagens
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { cellId } = await params;
  const messages = await getCellMessages(cellId);
  return Response.json(messages);
}

// POST /api/mdc/cells/[cellId]/chat — envia mensagem
export async function POST(
  req: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.type === "guest") {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) {
    return Response.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  const message = await createCellMessage({
    cellId,
    fromUserId: session.user.id,
    content: content.trim(),
  });

  // Push para todos os membros ativos, exceto o remetente
  const members = await getCellMembers(cellId);
  const otherIds = members
    .map((m) => m.userId)
    .filter((id): id is string => !!id && id !== session.user.id);

  if (otherIds.length > 0) {
    const subs = await getAllPushSubscriptionsForUsers(otherIds);
    const senderName = session.user.name ?? "Alguém";
    await Promise.all(
      subs.map(async (sub) => {
        const ok = await sendPush(sub, {
          title: `💬 ${senderName}`,
          body: content.trim().length > 80 ? content.trim().slice(0, 77) + "…" : content.trim(),
          url: `/mdc/cells/${cellId}/chat`,
        });
        if (!ok) await deletePushSubscription(sub.endpoint);
      })
    );
  }

  return Response.json(message, { status: 201 });
}
