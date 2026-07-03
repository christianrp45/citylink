import { auth } from "@/app/(auth)/auth";
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

  return Response.json({ ...cellData, members, meetings, memberCount });
}
