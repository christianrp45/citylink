import { auth } from "@/app/(auth)/auth";
import { deleteCommunity, getCommunityById, getCommunityMembers, updateCommunity } from "@/lib/db/queries";

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

  const members = await getCommunityMembers(id);
  return Response.json({ ...community, members });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const comm = await getCommunityById(id);
  if (!comm) return Response.json({ error: "Comunidade não encontrada" }, { status: 404 });
  if (comm.adminUserId !== session.user.id) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const allowed = ['name', 'description', 'type', 'city', 'address', 'phone', 'website', 'isPublic', 'requireApproval'];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  if (data.name !== undefined && !(data.name as string).trim()) {
    return Response.json({ error: "Nome não pode ser vazio" }, { status: 400 });
  }

  await updateCommunity(id, data);
  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const comm = await getCommunityById(id);
  if (!comm) {
    return Response.json({ error: "Comunidade não encontrada" }, { status: 404 });
  }

  // Apenas o admin/owner da comunidade pode deletá-la
  if (comm.adminUserId !== session.user.id) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    await deleteCommunity(id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Erro ao deletar comunidade:", err);
    return Response.json({ error: "Erro interno ao deletar comunidade" }, { status: 500 });
  }
}
