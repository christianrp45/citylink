import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { event, eventAttendee, user } from "../schema";

export async function getEvents() {
  return db
    .select({
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      address: event.address,
      lat: event.lat,
      lng: event.lng,
      date: event.date,
      organizerId: event.organizerId,
      organizerName: user.name,
      organizerAvatar: user.avatar,
      createdAt: event.createdAt,
    })
    .from(event)
    .leftJoin(user, eq(event.organizerId, user.id))
    .orderBy(asc(event.date));
}

export async function getMyEventIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ eventId: eventAttendee.eventId })
    .from(eventAttendee)
    .where(eq(eventAttendee.userId, userId));
  return rows.map((r) => r.eventId);
}

export async function createEvent(data: {
  title: string;
  description?: string;
  type: "social" | "religious" | "volunteer" | "business";
  address?: string;
  lat?: string;
  lng?: string;
  date: Date;
  organizerId: string;
}) {
  const [created] = await db.insert(event).values(data).returning();
  return created;
}

export async function joinEvent(eventId: string, userId: string) {
  await db
    .insert(eventAttendee)
    .values({ eventId, userId })
    .onConflictDoNothing();
}

export async function leaveEvent(eventId: string, userId: string) {
  await db
    .delete(eventAttendee)
    .where(
      and(eq(eventAttendee.eventId, eventId), eq(eventAttendee.userId, userId))
    );
}
