import { auth } from "@/app/(auth)/auth";
import { markMessagesAsRead } from "@/lib/db/queries";

// POST /api/messages/[userId]/read — marcar mensagens de [userId] como lidas
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { userId: fromUserId } = await params;

  await markMessagesAsRead(fromUserId, session.user.id);

  return Response.json({ ok: true });
}
