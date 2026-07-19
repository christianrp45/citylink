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

  if (cellData.entryMode === "invite_only") {
    return Response.json(
      { error: "Esta célula só aceita novos membros via convite. Peça um link a alguém do grupo." },
      { status: 403 }
    );
  }

  const currentCount = await getCellMemberCount(cellId);
  if (cellData.maxMembers && currentCount >= cellData.maxMembers) {
    return Response.json({ error: "Célula atingiu o número máximo de membros" }, { status: 400 });
  }

  await joinCell(cellId, session.user.id);

  return Response.json({ success: true, message: "Você entrou na célula!" });
}
