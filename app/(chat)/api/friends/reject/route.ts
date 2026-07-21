import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { friendship } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

// POST /api/friends/reject — recusar pedido de amizade
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { friendId } = await request.json();
  if (!friendId || typeof friendId !== "string") {
    return Response.json({ error: "friendId inválido" }, { status: 400 });
  }

  await db
    .delete(friendship)
    .where(
      and(eq(friendship.userId, friendId), eq(friendship.friendId, session.user.id))
    );

  return Response.json({ ok: true });
}
