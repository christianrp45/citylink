import { auth } from "@/app/(auth)/auth";
import {
  getCommunityById,
  approveCommunityMember,
  getPendingCommunityMembers,
  getUserCommunityRole,
} from "@/lib/db/queries";

// GET — lista membros pendentes (admin/owner apenas)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const community = await getCommunityById(id);
  if (!community) {
    return Response.json({ error: "Comunidade não encontrada" }, { status: 404 });
  }

  const myRole = await getUserCommunityRole(id, session.user.id);
  const canManage =
    community.adminUserId === session.user.id ||
    myRole?.role === "owner" ||
    myRole?.role === "admin";

  if (!canManage) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const pending = await getPendingCommunityMembers(id);
  return Response.json(pending);
}

// POST — aprova um membro pendente
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const community = await getCommunityById(id);
  if (!community) {
    return Response.json({ error: "Comunidade não encontrada" }, { status: 404 });
  }

  const myRole = await getUserCommunityRole(id, session.user.id);
  const canManage =
    community.adminUserId === session.user.id ||
    myRole?.role === "owner" ||
    myRole?.role === "admin";

  if (!canManage) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return Response.json({ error: "userId obrigatório" }, { status: 400 });
  }

  await approveCommunityMember(id, userId);
  return Response.json({ message: "Membro aprovado" });
}
