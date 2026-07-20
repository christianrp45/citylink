import "server-only";

import { and, desc, eq, inArray, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cell, cellMember, cellMeeting, cellAttendance, prayerRequest, user } from "../schema";

export async function getLeaderDashboard(leaderId: string) {
  // 1. Células onde o usuário é líder ou co-líder
  const leaderCells = await db
    .select()
    .from(cell)
    .where(
      inArray(cell.id,
        (await db
          .select({ id: cell.id })
          .from(cell)
          .where(eq(cell.leaderId, leaderId))
        ).concat(
          await db
            .select({ id: cell.id })
            .from(cell)
            .where(eq(cell.coLeaderId, leaderId))
        ).map((r) => r.id)
      )
    );

  if (leaderCells.length === 0) return null;

  const results = await Promise.all(
    leaderCells.map(async (c) => {
      // 2a. Contagem de membros ativos
      const [memberCountRow] = await db
        .select({ count: count() })
        .from(cellMember)
        .where(and(eq(cellMember.cellId, c.id), eq(cellMember.isActive, true)));
      const memberCount = memberCountRow?.count ?? 0;

      // 2b. Últimas 8 reuniões concluídas com presença
      const meetings = await db
        .select()
        .from(cellMeeting)
        .where(and(eq(cellMeeting.cellId, c.id), eq(cellMeeting.status, "completed")))
        .orderBy(desc(cellMeeting.scheduledAt))
        .limit(8);

      const meetingsWithAttendance = await Promise.all(
        meetings.map(async (m) => {
          const attendance = await db
            .select({ attended: cellAttendance.attended })
            .from(cellAttendance)
            .where(eq(cellAttendance.meetingId, m.id));
          const total = attendance.length;
          const attended = attendance.filter((a) => a.attended).length;
          return {
            id: m.id,
            scheduledAt: m.scheduledAt,
            attendedCount: attended,
            totalRsvp: total,
            attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0,
          };
        })
      );

      // 2c. Próxima reunião agendada
      const [nextMeeting] = await db
        .select()
        .from(cellMeeting)
        .where(and(eq(cellMeeting.cellId, c.id), eq(cellMeeting.status, "scheduled")))
        .orderBy(cellMeeting.scheduledAt)
        .limit(1);

      // 2d. Pedidos de oração ativos
      const [prayerCountRow] = await db
        .select({ count: count() })
        .from(prayerRequest)
        .where(and(eq(prayerRequest.cellId, c.id), eq(prayerRequest.isAnswered, false)));
      const activePrayerCount = prayerCountRow?.count ?? 0;

      // 2e. Membros inativos (não apareceram nas últimas 3 reuniões concluídas)
      const last3MeetingIds = meetings.slice(0, 3).map((m) => m.id);

      const allMembers = await db
        .select({
          userId: cellMember.userId,
          userName: user.name,
          userAvatar: user.avatar,
          role: cellMember.role,
          joinedAt: cellMember.joinedAt,
        })
        .from(cellMember)
        .leftJoin(user, eq(cellMember.userId, user.id))
        .where(and(eq(cellMember.cellId, c.id), eq(cellMember.isActive, true)));

      let inactiveMembers: typeof allMembers = [];
      if (last3MeetingIds.length >= 2) {
        const attendedUserIds = new Set(
          (
            await db
              .select({ userId: cellAttendance.userId })
              .from(cellAttendance)
              .where(
                and(
                  inArray(cellAttendance.meetingId, last3MeetingIds),
                  eq(cellAttendance.attended, true)
                )
              )
          ).map((a) => a.userId)
        );
        inactiveMembers = allMembers.filter(
          (m) => m.role === "member" && !attendedUserIds.has(m.userId)
        );
      }

      return {
        cell: c,
        memberCount,
        activePrayerCount,
        nextMeeting: nextMeeting ?? null,
        meetingsHistory: meetingsWithAttendance,
        inactiveMembers,
      };
    })
  );

  return results;
}
