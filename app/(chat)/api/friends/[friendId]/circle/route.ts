import { auth } from "@/app/(auth)/auth";
import { getFriendshipStatus, updateFriendCircle } from "@/lib/db/queries";

// GET /api/friends/[friendId]/circle — retorna status da amizade e círculo atual
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { friendId } = await params;
  const friendship = await getFriendshipStatus(session.user.id, friendId);

  if (!friendship) {
    return Response.json({ status: "none", circle: null });
  }

  return Response.json({ status: friendship.status, circle: friendship.circle ?? "friends" });
}

// PATCH /api/friends/[friendId]/circle — move o amigo entre os círculos
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ friendId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { friendId } = await params;
  const { circle } = await request.json();

  if (circle !== "family" && circle !== "friends" && circle !== "members") {
    return Response.json(
      { error: "circle deve ser 'family', 'friends' ou 'members'" },
      { status: 400 }
    );
  }

  await updateFriendCircle(session.user.id, friendId, circle);
  return Response.json({ success: true, circle });
}
