import { auth } from "@/app/(auth)/auth";
import { getMeetingById, updateMeetingStatus } from "@/lib/db/queries-cells";
import { getCellById } from "@/lib/db/queries-cells";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const meeting = await getMeetingById(meetingId);
  if (!meeting) {
    return Response.json({ error: "Encontro não encontrado" }, { status: 404 });
  }

  // Verifica se o usuário é líder ou co-líder da célula
  const cell = await getCellById(meeting.cellId);
  if (
    !cell ||
    (cell.leaderId !== session.user.id && cell.coLeaderId !== session.user.id)
  ) {
    return Response.json({ error: "Apenas o líder pode atualizar o encontro" }, { status: 403 });
  }

  const { status } = await request.json();
  if (!["scheduled", "completed", "cancelled"].includes(status)) {
    return Response.json({ error: "Status inválido" }, { status: 400 });
  }

  const updated = await updateMeetingStatus(meetingId, status);
  return Response.json(updated);
}
