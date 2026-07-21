import { auth } from "@/app/(auth)/auth";
import { getCommunityById, joinCommunity, leaveCommunity } from "@/lib/db/queries";
import { awardPoints } from "@/lib/gamification";

export async function POST(
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

  await joinCommunity(id, session.user.id, community.requireApproval ?? false);
  if (!community.requireApproval) void awardPoints(session.user.id, "join_group");

  const message = community.requireApproval
    ? "Solicitação enviada, aguardando aprovação"
    : "Você entrou na comunidade";
  return Response.json({ message });
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
  await leaveCommunity(id, session.user.id);
  return Response.json({ message: "Você saiu da comunidade" });
}
