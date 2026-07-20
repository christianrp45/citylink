import "server-only";

import { and, desc, eq, gte, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cell, cellMember, cellMeeting, cellAttendance, prayerRequest, user } from "../schema";

export type WeeklyReportEntry = {
  leaderId: string;
  leaderName: string | null;
  cellId: string;
  cellName: string;
  lastMeetingAttendance: number | null; // % de presença
  lastMeetingDate: Date | null;
  newPrayerRequests: number;
  inactiveCount: number;
};

export async function getWeeklyReportData(): Promise<WeeklyReportEntry[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Todas as células com líder
  const cells = await db
    .select({
      cellId: cell.id,
      cellName: cell.name,
      leaderId: cell.leaderId,
      leaderName: user.name,
    })
    .from(cell)
    .leftJoin(user, eq(cell.leaderId, user.id));

  if (cells.length === 0) return [];

  const results = await Promise.all(
    cells.map(async ({ cellId, cellName, leaderId, leaderName }) => {
      // 1. Última reunião concluída nos últimos 7 dias
      const [lastMeeting] = await db
        .select()
        .from(cellMeeting)
        .where(
          and(
            eq(cellMeeting.cellId, cellId),
            eq(cellMeeting.status, "completed"),
            gte(cellMeeting.scheduledAt, sevenDaysAgo)
          )
        )
        .orderBy(desc(cellMeeting.scheduledAt))
        .limit(1);

      let lastMeetingAttendance: number | null = null;
      let lastMeetingDate: Date | null = null;

      if (lastMeeting) {
        lastMeetingDate = lastMeeting.scheduledAt;
        const attendance = await db
          .select({ attended: cellAttendance.attended })
          .from(cellAttendance)
          .where(eq(cellAttendance.meetingId, lastMeeting.id));
        const total = attendance.length;
        const attended = attendance.filter((a) => a.attended).length;
        lastMeetingAttendance = total > 0 ? Math.round((attended / total) * 100) : 0;
      }

      // 2. Novos pedidos de oração nos últimos 7 dias
      const [prayerRow] = await db
        .select({ count: count() })
        .from(prayerRequest)
        .where(
          and(
            eq(prayerRequest.cellId, cellId),
            eq(prayerRequest.isAnswered, false),
            gte(prayerRequest.createdAt, sevenDaysAgo)
          )
        );
      const newPrayerRequests = prayerRow?.count ?? 0;

      // 3. Membros inativos (ausentes nas últimas 3 reuniões concluídas)
      const last3Meetings = await db
        .select({ id: cellMeeting.id })
        .from(cellMeeting)
        .where(and(eq(cellMeeting.cellId, cellId), eq(cellMeeting.status, "completed")))
        .orderBy(desc(cellMeeting.scheduledAt))
        .limit(3);

      let inactiveCount = 0;
      const last3Ids = last3Meetings.map((m) => m.id);

      if (last3Ids.length >= 2) {
        const { inArray } = await import("drizzle-orm");
        const attendedIds = new Set(
          (
            await db
              .select({ userId: cellAttendance.userId })
              .from(cellAttendance)
              .where(
                and(
                  inArray(cellAttendance.meetingId, last3Ids),
                  eq(cellAttendance.attended, true)
                )
              )
          ).map((a) => a.userId)
        );

        const allMembers = await db
          .select({ userId: cellMember.userId, role: cellMember.role })
          .from(cellMember)
          .where(and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true)));

        inactiveCount = allMembers.filter(
          (m) => m.role === "member" && !attendedIds.has(m.userId)
        ).length;
      }

      return {
        leaderId,
        leaderName,
        cellId,
        cellName,
        lastMeetingAttendance,
        lastMeetingDate,
        newPrayerRequests,
        inactiveCount,
      };
    })
  );

  return results;
}
