import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { friendship, user } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

// GET /api/friends/pending — pedidos de amizade recebidos aguardando confirmação
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const rows = await db
    .select({
      senderId: friendship.userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderProfession: user.profession,
      createdAt: friendship.createdAt,
    })
    .from(friendship)
    .innerJoin(user, eq(friendship.userId, user.id))
    .where(
      and(
        eq(friendship.friendId, session.user.id),
        eq(friendship.status, "pending")
      )
    )
    .orderBy(desc(friendship.createdAt));

  return Response.json(rows);
}
