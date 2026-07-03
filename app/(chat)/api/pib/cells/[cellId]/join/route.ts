import { auth } from "@/app/(auth)/auth";
import { getCellById, getCellMemberCount, joinCell } from "@/lib/db/queries-cells";

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

  if (!cellData.isOpen) {
    return Response.json({ error: "Esta célula não está aceitando novos membros" }, { status: 403 });
  }

  const currentCount = await getCellMemberCount(cellId);
  if (cellData.maxMembers && currentCount >= cellData.maxMembers) {
    return Response.json({ error: "Célula atingiu o número máximo de membros" }, { status: 400 });
  }

  await joinCell(cellId, session.user.id);

  return Response.json({ success: true, message: "Você entrou na célula!" });
}
