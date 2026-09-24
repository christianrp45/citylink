import { auth } from "@/app/(auth)/auth";
import { getCellById, getCellMemberCount, joinCell } from "@/lib/db/queries-cells";
import { awardPoints } from "@/lib/gamification";

// Sempre é possível solicitar vínculo — o acesso ao conteúdo só é liberado
// quando o líder aceita o pedido (ver /members/[userId]/approve).
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId } = await params;
  const cellData = await getCellById(cellId);

  if (!cellData) {
    return Response.json({ error: "Célula não encontrada" }, { status: 404 });
  }

  const currentCount = await getCellMemberCount(cellId);
  if (cellData.maxMembers && currentCount >= cellData.maxMembers) {
    return Response.json({ error: "Célula atingiu o número máximo de membros" }, { status: 400 });
  }

  const { pending } = await joinCell(cellId, session.user.id);
  if (!pending) void awardPoints(session.user.id, "join_group");

  return Response.json({
    success: true,
    pending,
    message: pending
      ? "Pedido enviado! Você terá acesso assim que o líder aceitar."
      : "Você voltou à célula!",
  });
}
