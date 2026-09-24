import { auth } from "@/app/(auth)/auth";
import { getAttendanceByMeeting, markAttendance, getMeetingById, getCellById } from "@/lib/db/queries-cells";
import { isApprovedCellMember } from "@/lib/db/queries";
import { awardPoints } from "@/lib/gamification";

async function resolveCellId(meetingId: string) {
  const meeting = await getMeetingById(meetingId);
  return meeting?.cellId ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const cellId = await resolveCellId(meetingId);
  if (!cellId || !(await isApprovedCellMember(cellId, session.user.id))) {
    return Response.json({ error: "Você não faz parte desta célula" }, { status: 403 });
  }

  const attendance = await getAttendanceByMeeting(meetingId);
  return Response.json(attendance);
}

// Só o líder marca presença — evita que qualquer membro forje presença/pontos de outra pessoa
export async function POST(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const cellId = await resolveCellId(meetingId);
  if (!cellId) {
    return Response.json({ error: "Reunião não encontrada" }, { status: 404 });
  }

  const cellData = await getCellById(cellId);
  const isLeader = cellData?.leaderId === session.user.id || cellData?.coLeaderId === session.user.id;
  if (!isLeader) {
    return Response.json({ error: "Apenas o líder pode marcar presença" }, { status: 403 });
  }

  const { userId, attended } = await request.json();

  if (!userId || attended === undefined) {
    return Response.json({ error: "userId e attended são obrigatórios" }, { status: 400 });
  }

  await markAttendance(meetingId, userId, attended);

  if (attended) void awardPoints(userId, "attend_meeting");

  return Response.json({ success: true });
}
