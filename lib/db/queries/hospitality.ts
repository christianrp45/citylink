import "server-only";

import { and, asc, eq, gte, isNotNull, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db/client";
import { hospitalityWindow, user } from "../schema";

export async function createHospitalityWindow(params: {
  userId: string;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  radiusMeters?: number;
}) {
  const [row] = await db
    .insert(hospitalityWindow)
    .values({
      userId: params.userId,
      title: params.title,
      description: params.description ?? null,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      radiusMeters: params.radiusMeters ?? 5000,
    })
    .returning();
  return row;
}

export async function getActiveHospitalityWindows() {
  const now = new Date();
  const host = alias(user, "host");
  return db
    .select({
      id: hospitalityWindow.id,
      title: hospitalityWindow.title,
      description: hospitalityWindow.description,
      startsAt: hospitalityWindow.startsAt,
      endsAt: hospitalityWindow.endsAt,
      radiusMeters: hospitalityWindow.radiusMeters,
      userId: hospitalityWindow.userId,
      hostName: host.name,
      hostAvatar: host.avatar,
      hostProfession: host.profession,
      hostLat: host.lat,
      hostLng: host.lng,
    })
    .from(hospitalityWindow)
    .innerJoin(host, eq(host.id, hospitalityWindow.userId))
    .where(
      and(
        lte(hospitalityWindow.startsAt, now),
        gte(hospitalityWindow.endsAt, now),
        isNotNull(host.lat),
        isNotNull(host.lng)
      )
    )
    .orderBy(asc(hospitalityWindow.startsAt));
}

export async function getUserActiveWindow(userId: string) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(hospitalityWindow)
    .where(
      and(
        eq(hospitalityWindow.userId, userId),
        lte(hospitalityWindow.startsAt, now),
        gte(hospitalityWindow.endsAt, now)
      )
    )
    .orderBy(asc(hospitalityWindow.startsAt))
    .limit(1);
  return row ?? null;
}

export async function deleteHospitalityWindow(id: string, userId: string) {
  await db
    .delete(hospitalityWindow)
    .where(
      and(eq(hospitalityWindow.id, id), eq(hospitalityWindow.userId, userId))
    );
}
