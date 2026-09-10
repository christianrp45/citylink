import { auth } from "@/app/(auth)/auth";
import { getChurchById, getChurchMembers, addChurchMember, removeChurchMember } from "@/lib/db/queries";

async function verifyAdmin(churchId: string, userId: string) {
  const ch = await getChurchById(churchId);
  if (!ch) return null;
  if (ch.adminUserId !== userId) return null;
  return ch;
}

// GET — lista membros da igreja
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const church = await verifyAdmin(id, session.user.id);
  if (!church) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const members = await getChurchMembers(id);
  return Response.json({ church, members });
}

// POST — adiciona membro diretamente { userId }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const church = await verifyAdmin(id, session.user.id);
  if (!church) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return Response.json({ error: "userId obrigatório" }, { status: 400 });

  await addChurchMember(id, userId);
  return Response.json({ ok: true });
}

// DELETE — remove membro { userId }
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const church = await verifyAdmin(id, session.user.id);
  if (!church) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return Response.json({ error: "userId obrigatório" }, { status: 400 });

  await removeChurchMember(userId);
  return Response.json({ ok: true });
}
