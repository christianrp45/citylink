import { auth } from "@/app/(auth)/auth";
import { getFriendshipStatus, sendFriendRequest } from "@/lib/db/queries";

// POST /api/friends/request — enviar pedido de amizade
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { friendId } = await request.json();

  if (!friendId || typeof friendId !== "string") {
    return Response.json({ error: "friendId inválido" }, { status: 400 });
  }

  if (friendId === session.user.id) {
    return Response.json(
      { error: "Você não pode adicionar a si mesmo" },
      { status: 400 }
    );
  }

  // Verifica se já existe relação
  const existing = await getFriendshipStatus(session.user.id, friendId);
  if (existing) {
    return Response.json(
      { error: "Pedido já enviado ou amizade já existe" },
      { status: 409 }
    );
  }

  const [row] = await sendFriendRequest(session.user.id, friendId);
  return Response.json(row, { status: 201 });
}
