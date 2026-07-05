import "server-only";

import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  cell,
  cellAttendance,
  cellGuide,
  cellMember,
  cellMeeting,
  prayerInteraction,
  prayerRequest,
  user,
} from "./schema";

// biome-ignore lint: Needed outside of TS
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// ─── CÉLULAS ─────────────────────────────────────────────────

export async function getCells(filters?: { communityId?: string | null }) {
  const conditions = [];
  if (filters?.communityId !== undefined) {
    conditions.push(
      filters.communityId === null
        ? isNull(cell.communityId)
        : eq(cell.communityId, filters.communityId)
    );
  }

  const cells = await db
    .select({
      id: cell.id,
      name: cell.name,
      description: cell.description,
      communityId: cell.communityId,
      neighborhood: cell.neighborhood,
      address: cell.address,
      meetingDay: cell.meetingDay,
      meetingTime: cell.meetingTime,
      targetAudience: cell.targetAudience,
      maxMembers: cell.maxMembers,
      isOpen: cell.isOpen,
      createdAt: cell.createdAt,
      leaderId: cell.leaderId,
      leaderName: user.email,
    })
    .from(cell)
    .leftJoin(user, eq(cell.leaderId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cell.createdAt));

  return cells;
}

export async function getCellById(id: string) {
  const [result] = await db
    .select()
    .from(cell)
    .where(eq(cell.id, id));
  return result ?? null;
}

export async function createCell(data: {
  name: string;
  description?: string;
  communityId?: string;
  leaderId: string;
  neighborhood?: string;
  address?: string;
  meetingDay?: number;
  meetingTime?: string;
  targetAudience?: "jovens" | "casais" | "adultos" | "terceira-idade" | "misto";
  maxMembers?: number;
}) {
  const [newCell] = await db.insert(cell).values(data).returning();

  // líder entra automaticamente como membro
  await db.insert(cellMember).values({
    cellId: newCell.id,
    userId: data.leaderId,
    role: "leader",
  });

  return newCell;
}

// ─── MEMBROS ─────────────────────────────────────────────────

export async function getCellMembers(cellId: string) {
  return db
    .select({
      cellId: cellMember.cellId,
      userId: cellMember.userId,
      userEmail: user.email,
      role: cellMember.role,
      isActive: cellMember.isActive,
      joinedAt: cellMember.joinedAt,
    })
    .from(cellMember)
    .leftJoin(user, eq(cellMember.userId, user.id))
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true)));
}

export async function getCellMemberCount(cellId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.isActive, true)));
  return result?.count ?? 0;
}

export async function joinCell(cellId: string, userId: string) {
  const existing = await db
    .select()
    .from(cellMember)
    .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));

  if (existing.length > 0) {
    // reativar se estava inativo
    await db
      .update(cellMember)
      .set({ isActive: true })
      .where(and(eq(cellMember.cellId, cellId), eq(cellMember.userId, userId)));
    return;
  }

  await db.insert(cellMember).values({ cellId, userId, role: "member" });
}

// ─── ENCONTROS ───────────────────────────────────────────────

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

// ─── RSVP ────────────────────────────────────────────────────

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

// ─── ROTEIRO ─────────────────────────────────────────────────

export async function getGuideByMeeting(meetingId: string) {
  const [result] = await db
    .select()
    .from(cellGuide)
    .where(eq(cellGuide.meetingId, meetingId));
  return result ?? null;
}

export async function upsertGuide(data: {
  meetingId: string;
  title: string;
  biblePassage?: string;
  sermonTitle?: string;
  preacher?: string;
  theme?: string;
  leaderNote?: string;
  icebreakerTitle?: string;
  icebreaker?: string;
  youtubeLinks?: { title: string; url: string }[];
  introduction?: string;
  studyPoints?: { title: string; bibleRef: string; content: string; discussionQuestion: string }[];
  conclusion?: string;
  evangelism?: string;
  evangelismStory?: string;
  evangelismChallenge?: string;
  studyQuestions?: string[];
  application?: string;
  prayer?: string;
  isPublished?: boolean;
  generatedByAI?: boolean;
}) {
  const existing = await getGuideByMeeting(data.meetingId);

  if (existing) {
    const [updated] = await db
      .update(cellGuide)
      .set({
        ...data,
        publishedAt:
          data.isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
      })
      .where(eq(cellGuide.meetingId, data.meetingId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(cellGuide)
    .values({
      ...data,
      publishedAt: data.isPublished ? new Date() : undefined,
    })
    .returning();
  return created;
}

// ─── PEDIDOS DE ORAÇÃO ───────────────────────────────────────

export async function getPrayerRequestsByCell(cellId: string, userId: string) {
  const requests = await db
    .select({
      id: prayerRequest.id,
      cellId: prayerRequest.cellId,
      userId: prayerRequest.userId,
      userEmail: user.email,
      content: prayerRequest.content,
      isAnonymous: prayerRequest.isAnonymous,
      isAnswered: prayerRequest.isAnswered,
      createdAt: prayerRequest.createdAt,
    })
    .from(prayerRequest)
    .leftJoin(user, eq(prayerRequest.userId, user.id))
    .where(eq(prayerRequest.cellId, cellId))
    .orderBy(desc(prayerRequest.createdAt));

  // contar interações e verificar se o usuário já orou
  const withCounts = await Promise.all(
    requests.map(async (r) => {
      const [{ total }] = await db
        .select({ total: count() })
        .from(prayerInteraction)
        .where(eq(prayerInteraction.prayerRequestId, r.id));

      const userPrayed = await db
        .select()
        .from(prayerInteraction)
        .where(
          and(
            eq(prayerInteraction.prayerRequestId, r.id),
            eq(prayerInteraction.userId, userId)
          )
        );

      return {
        ...r,
        prayerCount: total,
        userHasPrayed: userPrayed.length > 0,
      };
    })
  );

  return withCounts;
}

export async function createPrayerRequest(data: {
  cellId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
}) {
  const [newRequest] = await db
    .insert(prayerRequest)
    .values(data)
    .returning();
  return newRequest;
}

export async function togglePrayerInteraction(
  prayerRequestId: string,
  userId: string
) {
  const existing = await db
    .select()
    .from(prayerInteraction)
    .where(
      and(
        eq(prayerInteraction.prayerRequestId, prayerRequestId),
        eq(prayerInteraction.userId, userId)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(prayerInteraction)
      .where(
        and(
          eq(prayerInteraction.prayerRequestId, prayerRequestId),
          eq(prayerInteraction.userId, userId)
        )
      );
    return { praying: false };
  }

  await db
    .insert(prayerInteraction)
    .values({ prayerRequestId, userId });
  return { praying: true };
}

export async function markPrayerAnswered(id: string) {
  await db
    .update(prayerRequest)
    .set({ isAnswered: true })
    .where(eq(prayerRequest.id, id));
}
