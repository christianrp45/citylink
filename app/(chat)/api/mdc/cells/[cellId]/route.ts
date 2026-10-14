import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { cell } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getCellById,
  getCellMemberCount,
  getCellMembers,
  getMeetingsByCell,
  isApprovedCellMember,
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

  const memberCount = await getCellMemberCount(cellId);

  // Informação básica é visível pra quem está decidindo pedir vínculo;
  // membros (e-mail) e reuniões (endereço, notas) só pra quem já foi aceito.
  const approved = await isApprovedCellMember(cellId, session.user.id);
  if (!approved) {
    return Response.json({ ...cellData, memberCount, approved: false });
  }

  const [members, meetings] = await Promise.all([
    getCellMembers(cellId),
    getMeetingsByCell(cellId),
  ]);

  const leaderMember = members.find((m) => m.role === "leader");
  const leaderName = leaderMember?.userEmail ?? "";

  return Response.json({ ...cellData, members, meetings, memberCount, leaderName, approved: true });
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
  const { name, entryMode } = body;

  if (name === undefined && entryMode === undefined) {
    return Response.json({ error: "Informe name ou entryMode" }, { status: 400 });
  }

  const updates: Partial<{ name: string; entryMode: "open" | "invite_only" }> = {};

  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) {
      return Response.json({ error: "Nome não pode ser vazio" }, { status: 400 });
    }
    updates.name = trimmed.slice(0, 100);
  }

  if (entryMode !== undefined) {
    if (entryMode !== "open" && entryMode !== "invite_only") {
      return Response.json({ error: "Modo de entrada inválido" }, { status: 400 });
    }
    updates.entryMode = entryMode;
  }

  await db.update(cell).set(updates).where(eq(cell.id, cellId));

  return Response.json({ success: true, ...updates });
}
