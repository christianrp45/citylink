import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cellGuide, cellMeeting } from "../schema";

export async function getGuidesForCell(cellId: string) {
  return db
    .select({
      guideId: cellGuide.id,
      meetingId: cellMeeting.id,
      scheduledAt: cellMeeting.scheduledAt,
      meetingStatus: cellMeeting.status,
      title: cellGuide.title,
      sermonTitle: cellGuide.sermonTitle,
      preacher: cellGuide.preacher,
      biblePassage: cellGuide.biblePassage,
      theme: cellGuide.theme,
      isPublished: cellGuide.isPublished,
      generatedByAI: cellGuide.generatedByAI,
      createdAt: cellGuide.createdAt,
    })
    .from(cellGuide)
    .innerJoin(cellMeeting, eq(cellGuide.meetingId, cellMeeting.id))
    .where(eq(cellMeeting.cellId, cellId))
    .orderBy(desc(cellMeeting.scheduledAt));
}

export async function deleteGuide(meetingId: string) {
  await db.delete(cellGuide).where(eq(cellGuide.meetingId, meetingId));
}

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
  studyPoints?: { title: string; bibleRef: string; content: string; discussionQuestion: string; innerReflection?: string }[];
  conclusion?: string;
  evangelism?: string;
  evangelismStory?: string;
  evangelismChallenge?: string;
  studyQuestions?: string[];
  application?: string;
  prayer?: string;
  isPublished?: boolean;
  generatedByAI?: boolean;
  leaderNotes?: string;
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
