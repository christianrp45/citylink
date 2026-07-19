import { auth } from "@/app/(auth)/auth";
import { getCellById, getGuidesForCell, deleteGuide } from "@/lib/db/queries-cells";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId } = await params;
  const guides = await getGuidesForCell(cellId);
  return Response.json(guides);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId } = await params;
  const cell = await getCellById(cellId);
  if (
    !cell ||
    (cell.leaderId !== session.user.id && cell.coLeaderId !== session.user.id)
  ) {
    return Response.json({ error: "Apenas o líder pode excluir roteiros" }, { status: 403 });
  }

  const { meetingId } = await request.json();
  if (!meetingId) {
    return Response.json({ error: "meetingId é obrigatório" }, { status: 400 });
  }

  await deleteGuide(meetingId);
  return Response.json({ ok: true });
}
