import { auth } from "@/app/(auth)/auth";
import { getCellById, getPendingCellRequests } from "@/lib/db/queries-cells";

// GET /api/mdc/cells/[cellId]/requests — pedidos de vínculo pendentes (só líder/co-líder)
export async function GET(
  _request: Request,
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
    cellData.leaderId === session.user.id || cellData.coLeaderId === session.user.id;
  if (!isLeader) {
    return Response.json({ error: "Apenas o líder pode ver os pedidos de vínculo" }, { status: 403 });
  }

  const requests = await getPendingCellRequests(cellId);
  return Response.json(requests);
}
