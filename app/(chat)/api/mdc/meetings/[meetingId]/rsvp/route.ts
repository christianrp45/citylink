import { auth } from "@/app/(auth)/auth";
import { upsertRsvp, getMeetingById, isApprovedCellMember } from "@/lib/db/queries-cells";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const meeting = await getMeetingById(meetingId);
  if (!meeting || !(await isApprovedCellMember(meeting.cellId, session.user.id))) {
    return Response.json({ error: "Você não faz parte desta célula" }, { status: 403 });
  }

  const { status } = await request.json();

  const validStatus = ["going", "not-going", "maybe", "no-response"];
  if (!validStatus.includes(status)) {
    return Response.json({ error: "Status inválido" }, { status: 400 });
  }

  await upsertRsvp(meetingId, session.user.id, status);

  return Response.json({ success: true, status });
}
