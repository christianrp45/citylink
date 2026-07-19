import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { cell } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getCellById,
  getCellMemberCount,
  getCellMembers,
  getMeetingsByCell,
} from "@/lib/db/queries-cells";

export async function GET(
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

  const [members, meetings, memberCount] = await Promise.all([
    getCellMembers(cellId),
    getMeetingsByCell(cellId),
    getCellMemberCount(cellId),
  ]);

  const leaderMember = members.find((m) => m.role === "leader");
  const leaderName = leaderMember?.userEmail ?? "";

  return Response.json({ ...cellData, members, meetings, memberCount, leaderName });
}

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
    return Response.json({ error: "Apenas o líder pode alterar as configurações da célula" }, { status: 403 });
  }

  const body = await request.json();
  const { entryMode } = body;

  if (entryMode !== "open" && entryMode !== "invite_only") {
    return Response.json({ error: "Modo de entrada inválido" }, { status: 400 });
  }

  await db.update(cell).set({ entryMode }).where(eq(cell.id, cellId));

  return Response.json({ success: true, entryMode });
}
