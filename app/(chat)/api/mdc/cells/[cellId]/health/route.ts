import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { cell, cellAttendance, cellMeeting, cellMember, user } from '@/lib/db/schema';
import { and, desc, eq, gte, inArray } from 'drizzle-orm';

/** GET /api/mdc/cells/[cellId]/health
 *  Returns attendance health metrics for the last 8 completed meetings. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { cellId } = await params;

  // Verify user has access to this cell
  const [cellRow] = await db.select({ leaderId: cell.leaderId }).from(cell).where(eq(cell.id, cellId));
  if (!cellRow) return Response.json({ error: 'Célula não encontrada' }, { status: 404 });

  // Fetch last 8 completed meetings
  const meetings = await db
    .select({ id: cellMeeting.id, scheduledAt: cellMeeting.scheduledAt, status: cellMeeting.status })
    .from(cellMeeting)
    .where(and(eq(cellMeeting.cellId, cellId), eq(cellMeeting.status, 'completed')))
    .orderBy(desc(cellMeeting.scheduledAt))
    .limit(8);

  if (meetings.length === 0) {
    return Response.json({ totalMeetings: 0, avgRate: 0, memberStats: [], inactiveCount: 0 });
  }

  const meetingIds = meetings.map((m) => m.id);

  // Fetch all active members
  const members = await db
    .select({ userId: cellMember.userId, name: user.name, avatar: user.avatar, joinedAt: cellMember.joinedAt })
    .from(cellMember)
    .innerJoin(user, eq(cellMember.userId, user.id))
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true)));

  if (members.length === 0) {
    return Response.json({ totalMeetings: meetings.length, avgRate: 0, memberStats: [], inactiveCount: 0 });
  }

  const userIds = members.map((m) => m.userId);

  // Fetch attendance records for these meetings and members
  const attendance = await db
    .select({ meetingId: cellAttendance.meetingId, userId: cellAttendance.userId, attended: cellAttendance.attended })
    .from(cellAttendance)
    .where(
      and(
        inArray(cellAttendance.meetingId, meetingIds),
        inArray(cellAttendance.userId, userIds)
      )
    );

  // Compute per-member stats (only count meetings that occurred after the member joined)
  const totalMeetings = meetings.length;
  const memberStats = members.map((m) => {
    const eligibleMeetings = meetings.filter((mt) => new Date(mt.scheduledAt) >= new Date(m.joinedAt));
    const eligible = eligibleMeetings.length;
    const attended = attendance.filter(
      (a) => a.userId === m.userId && a.attended === true
    ).length;
    const rate = eligible > 0 ? attended / eligible : 0;
    return {
      userId: m.userId,
      name: m.name ?? 'Membro',
      avatar: m.avatar,
      attended,
      eligible,
      rate: Math.round(rate * 100),
    };
  });

  // Sort by attendance rate ascending (worst first for easy identification)
  memberStats.sort((a, b) => a.rate - b.rate);

  const avgRate =
    memberStats.length > 0
      ? Math.round(memberStats.reduce((s, m) => s + m.rate, 0) / memberStats.length)
      : 0;
  const inactiveCount = memberStats.filter((m) => m.eligible >= 2 && m.rate < 50).length;

  return Response.json({ totalMeetings, avgRate, memberStats, inactiveCount });
}
