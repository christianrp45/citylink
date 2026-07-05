import { auth } from "@/app/(auth)/auth";
import { updateFriendCircle } from "@/lib/db/queries";

// PATCH /api/friends/[friendId]/circle — move o amigo entre 'family' e 'friends'
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

  if (circle !== "family" && circle !== "friends") {
    return Response.json(
      { error: "circle deve ser 'family' ou 'friends'" },
      { status: 400 }
    );
  }

  await updateFriendCircle(session.user.id, friendId, circle);
  return Response.json({ success: true, circle });
}
