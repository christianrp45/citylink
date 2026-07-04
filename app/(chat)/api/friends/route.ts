import { auth } from "@/app/(auth)/auth";
import { getFriends, removeFriend } from "@/lib/db/queries";

// GET /api/friends — listar meus amigos
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const friends = await getFriends(session.user.id);
  return Response.json(friends);
}

// DELETE /api/friends — remover amigo { friendId }
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { friendId } = await request.json();

  if (!friendId || typeof friendId !== "string") {
    return Response.json({ error: "friendId inválido" }, { status: 400 });
  }

  await removeFriend(session.user.id, friendId);
  return Response.json({ ok: true });
}
