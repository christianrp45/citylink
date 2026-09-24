import { auth } from "@/app/(auth)/auth";
import { getCellById, approveCellMember, removeCellMember } from "@/lib/db/queries-cells";
import { awardPoints } from "@/lib/gamification";
import { getUserPushSubscriptions } from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

async function requireLeader(cellId: string, requesterId: string) {
  const cellData = await getCellById(cellId);
  if (!cellData) return { error: Response.json({ error: "Célula não encontrada" }, { status: 404 }) };
  const isLeader = cellData.leaderId === requesterId || cellData.coLeaderId === requesterId;
  if (!isLeader) {
    return { error: Response.json({ error: "Apenas o líder pode gerenciar pedidos de vínculo" }, { status: 403 }) };
  }
  return { cellData };
}

// POST /api/mdc/cells/[cellId]/requests/[userId] — aceita o pedido de vínculo
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ cellId: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId, userId } = await params;
  const { error } = await requireLeader(cellId, session.user.id);
  if (error) return error;

  await approveCellMember(cellId, userId);
  void awardPoints(userId, "join_group");

  try {
    const subs = await getUserPushSubscriptions(userId);
    for (const sub of subs) {
      await sendPush(sub, {
        title: "🎉 Vínculo aceito!",
        body: "Seu pedido pra entrar na célula foi aceito.",
        url: `/mdc/cells/${cellId}`,
      });
    }
  } catch {
    // push não é crítico
  }

  return Response.json({ success: true });
}

// DELETE /api/mdc/cells/[cellId]/requests/[userId] — recusa o pedido (ou remove um membro)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cellId: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId, userId } = await params;
  const { error } = await requireLeader(cellId, session.user.id);
  if (error) return error;

  await removeCellMember(cellId, userId);
  return Response.json({ success: true });
}
