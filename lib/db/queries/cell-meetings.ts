import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cellAttendance, cellMeeting, user } from "../schema";

export async function getMeetingsByCell(cellId: string) {
  return db
    .select()
    .from(cellMeeting)
    .where(eq(cellMeeting.cellId, cellId))
    .orderBy(desc(cellMeeting.scheduledAt));
}

export async function getMeetingById(meetingId: string) {
  const [result] = await db
    .select()
    .from(cellMeeting)
    .where(eq(cellMeeting.id, meetingId));
  return result ?? null;
}

export async function createMeeting(data: {
  cellId: string;
  scheduledAt: Date;
  address?: string;
}) {
  const [newMeeting] = await db.insert(cellMeeting).values(data).returning();
  return newMeeting;
}

export async function upsertRsvp(
  meetingId: string,
  userId: string,
  rsvpStatus: "going" | "not-going" | "maybe" | "no-response"
) {
  const existing = await db
    .select()
    .from(cellAttendance)
    .where(
      and(
        eq(cellAttendance.meetingId, meetingId),
        eq(cellAttendance.userId, userId)
      )
    );

  if (existing.length > 0) {
    await db
      .update(cellAttendance)
      .set({ rsvpStatus, respondedAt: new Date() })
      .where(
        and(
          eq(cellAttendance.meetingId, meetingId),
          eq(cellAttendance.userId, userId)
        )
      );
  } else {
    await db
      .insert(cellAttendance)
      .values({ meetingId, userId, rsvpStatus, respondedAt: new Date() });
  }
}

export async function markAttendance(
  meetingId: string,
  userId: string,
  attended: boolean
) {
  await db
    .update(cellAttendance)
    .set({ attended })
    .where(
      and(
        eq(cellAttendance.meetingId, meetingId),
        eq(cellAttendance.userId, userId)
      )
    );
}

export async function getAttendanceByMeeting(meetingId: string) {
  return db
    .select({
      userId: cellAttendance.userId,
      userEmail: user.email,
      rsvpStatus: cellAttendance.rsvpStatus,
      attended: cellAttendance.attended,
    })
    .from(cellAttendance)
    .leftJoin(user, eq(cellAttendance.userId, user.id))
    .where(eq(cellAttendance.meetingId, meetingId));
}
