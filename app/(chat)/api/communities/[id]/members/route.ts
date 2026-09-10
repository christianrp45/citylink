import { auth } from "@/app/(auth)/auth";
import {
  getCommunityById,
  getUserCommunityRole,
  addCommunityMemberDirect,
  removeCommunityMember,
} from "@/lib/db/queries";

async function verifyCanManage(communityId: string, userId: string) {
  const community = await getCommunityById(communityId);
  if (!community) return null;
  const myRole = await getUserCommunityRole(communityId, userId);
  const canManage =
    community.adminUserId === userId ||
    myRole?.role === "owner" ||
    myRole?.role === "admin";
  if (!canManage) return null;
  return community;
}

// POST — adiciona membro diretamente { userId, role? }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const community = await verifyCanManage(id, session.user.id);
  if (!community) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const { userId, role } = await request.json();
  if (!userId) return Response.json({ error: "userId obrigatório" }, { status: 400 });

  await addCommunityMemberDirect(id, userId, role ?? "member");
  return Response.json({ ok: true });
}

// DELETE — remove ou rejeita membro { userId }
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const community = await verifyCanManage(id, session.user.id);
  if (!community) return Response.json({ error: "Sem permissão" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return Response.json({ error: "userId obrigatório" }, { status: 400 });

  await removeCommunityMember(id, userId);
  return Response.json({ ok: true });
}
