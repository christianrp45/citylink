import { auth } from "@/app/(auth)/auth";
import { getChurchById, isChurchAdmin, removeChurchAdmin } from "@/lib/db/queries";

// DELETE — remove co-admin. Nunca remove o owner (church.adminUserId).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id, userId } = await params;
  if (!(await isChurchAdmin(id, session.user.id))) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const church = await getChurchById(id);
  if (church?.adminUserId === userId) {
    return Response.json({ error: "Não é possível remover o admin original da igreja" }, { status: 400 });
  }

  await removeChurchAdmin(id, userId);
  return Response.json({ ok: true });
}
