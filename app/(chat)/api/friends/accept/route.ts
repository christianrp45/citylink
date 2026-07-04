import { auth } from "@/app/(auth)/auth";
import { acceptFriendRequest } from "@/lib/db/queries";

// POST /api/friends/accept — aceitar pedido de amizade
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { friendId } = await request.json();

  if (!friendId || typeof friendId !== "string") {
    return Response.json({ error: "friendId inválido" }, { status: 400 });
  }

  await acceptFriendRequest(session.user.id, friendId);
  return Response.json({ ok: true });
}
