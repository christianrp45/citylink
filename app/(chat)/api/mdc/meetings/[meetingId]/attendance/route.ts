import { auth } from "@/app/(auth)/auth";
import { getAttendanceByMeeting, markAttendance } from "@/lib/db/queries-cells";
import { awardPoints } from "@/lib/gamification";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const attendance = await getAttendanceByMeeting(meetingId);
  return Response.json(attendance);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const { userId, attended } = await request.json();

  if (!userId || attended === undefined) {
    return Response.json({ error: "userId e attended são obrigatórios" }, { status: 400 });
  }

  await markAttendance(meetingId, userId, attended);

  if (attended) void awardPoints(userId, "attend_meeting");

  return Response.json({ success: true });
}
