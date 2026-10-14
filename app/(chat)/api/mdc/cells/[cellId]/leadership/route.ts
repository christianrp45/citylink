import { auth } from "@/app/(auth)/auth";
import {
  getCellById,
  isApprovedCellMember,
  setCellLeadership,
} from "@/lib/db/queries-cells";

// PATCH /api/mdc/cells/[cellId]/leadership — o próprio líder/co-líder repassa
// a liderança (ou define/remove um co-líder) pra outro membro aprovado da
// célula. Diferente de /api/admin/church/[id]/cells/[cellId]/leadership, que
// exige ser admin da igreja — aqui quem já lidera a célula resolve sozinho.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId } = await params;
  const cellData = await getCellById(cellId);
  if (!cellData) {
    return Response.json({ error: "Célula não encontrada" }, { status: 404 });
  }

  const isLeader =
    cellData.leaderId === session.user.id ||
    cellData.coLeaderId === session.user.id;
  if (!isLeader) {
    return Response.json({ error: "Apenas o líder pode alterar a liderança" }, { status: 403 });
  }

  const body = await request.json();
  const { leaderId, coLeaderId } = body;

  if (!leaderId && coLeaderId === undefined) {
    return Response.json({ error: "Informe leaderId ou coLeaderId" }, { status: 400 });
  }

  if (leaderId && !(await isApprovedCellMember(cellId, leaderId))) {
    return Response.json({ error: "O novo líder precisa ser membro aprovado desta célula" }, { status: 400 });
  }
  if (coLeaderId && !(await isApprovedCellMember(cellId, coLeaderId))) {
    return Response.json({ error: "O co-líder precisa ser membro aprovado desta célula" }, { status: 400 });
  }

  const updated = await setCellLeadership(cellId, {
    leaderId: leaderId || undefined,
    coLeaderId: coLeaderId === null ? null : coLeaderId || undefined,
  });

  return Response.json(updated);
}
