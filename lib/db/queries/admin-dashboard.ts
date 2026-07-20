import "server-only";

import { and, desc, eq, inArray, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  community,
  cell,
  cellMember,
  cellMeeting,
  cellAttendance,
  prayerRequest,
  user,
} from "../schema";

export async function getAdminDashboard(adminUserId: string) {
  // 1. Comunidades onde o usuário é admin
  const adminCommunities = await db
    .select({ id: community.id, name: community.name, type: community.type })
    .from(community)
    .where(eq(community.adminUserId, adminUserId));

  if (adminCommunities.length === 0) return null;

  const communityIds = adminCommunities.map((c) => c.id);

  // 2. Células vinculadas a essas comunidades
  const cells = await db
    .select()
    .from(cell)
    .where(inArray(cell.communityId, communityIds))
    .orderBy(cell.name);

  if (cells.length === 0) {
    return { communities: adminCommunities, cells: [], totals: null };
  }

  // 3. Stats por célula (mesma lógica do leader dashboard)
  const cellStats = await Promise.all(
    cells.map(async (c) => {
      const [memberCountRow] = await db
        .select({ count: count() })
        .from(cellMember)
        .where(and(eq(cellMember.cellId, c.id), eq(cellMember.isActive, true)));
      const memberCount = memberCountRow?.count ?? 0;

      const recentMeetings = await db
        .select()
        .from(cellMeeting)
        .where(and(eq(cellMeeting.cellId, c.id), eq(cellMeeting.status, "completed")))
        .orderBy(desc(cellMeeting.scheduledAt))
        .limit(5);

      const meetingsWithAttendance = await Promise.all(
        recentMeetings.map(async (m) => {
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

      const avgAttendance =
        meetingsWithAttendance.length > 0
          ? Math.round(
              meetingsWithAttendance.reduce((s, m) => s + m.attendanceRate, 0) /
                meetingsWithAttendance.length
            )
          : null;

      const [nextMeeting] = await db
        .select()
        .from(cellMeeting)
        .where(and(eq(cellMeeting.cellId, c.id), eq(cellMeeting.status, "scheduled")))
        .orderBy(cellMeeting.scheduledAt)
        .limit(1);

      const [prayerCountRow] = await db
        .select({ count: count() })
        .from(prayerRequest)
        .where(and(eq(prayerRequest.cellId, c.id), eq(prayerRequest.isAnswered, false)));
      const activePrayerCount = prayerCountRow?.count ?? 0;

      // Líder da célula
      const [leader] = await db
        .select({ name: user.name, avatar: user.avatar })
        .from(user)
        .where(eq(user.id, c.leaderId));

      // Membros inativos (ausentes nas últimas 3 reuniões)
      const last3Ids = recentMeetings.slice(0, 3).map((m) => m.id);
      let inactiveCount = 0;
      if (last3Ids.length >= 2) {
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
        const allActiveMembers = await db
          .select({ userId: cellMember.userId, role: cellMember.role })
          .from(cellMember)
          .where(and(eq(cellMember.cellId, c.id), eq(cellMember.isActive, true)));
        inactiveCount = allActiveMembers.filter(
          (m) => m.role === "member" && !attendedIds.has(m.userId)
        ).length;
      }

      return {
        cell: c,
        leader: leader ?? null,
        memberCount,
        avgAttendance,
        activePrayerCount,
        inactiveCount,
        nextMeeting: nextMeeting ?? null,
        recentMeetings: meetingsWithAttendance,
      };
    })
  );

  // 4. Totais agregados
  const totals = {
    totalCells: cells.length,
    totalMembers: cellStats.reduce((s, c) => s + c.memberCount, 0),
    totalPrayerRequests: cellStats.reduce((s, c) => s + c.activePrayerCount, 0),
    totalInactive: cellStats.reduce((s, c) => s + c.inactiveCount, 0),
    avgAttendance: (() => {
      const withData = cellStats.filter((c) => c.avgAttendance !== null);
      return withData.length > 0
        ? Math.round(withData.reduce((s, c) => s + (c.avgAttendance ?? 0), 0) / withData.length)
        : null;
    })(),
  };

  return { communities: adminCommunities, cells: cellStats, totals };
}
