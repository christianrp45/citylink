import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { alertResponse, samaritanAlert, user } from "../schema";
import { haversineMeters } from "@/lib/geo/haversine";

export async function getAlerts(
  lat?: number,
  lng?: number,
  radiusMeters = 5000
) {
  const rows = await db
    .select({
      id: samaritanAlert.id,
      userId: samaritanAlert.userId,
      userName: user.name,
      userAvatar: user.avatar,
      type: samaritanAlert.type,
      description: samaritanAlert.description,
      lat: samaritanAlert.lat,
      lng: samaritanAlert.lng,
      status: samaritanAlert.status,
      createdAt: samaritanAlert.createdAt,
    })
    .from(samaritanAlert)
    .leftJoin(user, eq(samaritanAlert.userId, user.id))
    .where(eq(samaritanAlert.status, "open"))
    .orderBy(desc(samaritanAlert.createdAt));

  if (!lat || !lng) return rows;

  return rows.filter((a) => {
    if (!a.lat || !a.lng) return true;
    return haversineMeters(lat, lng, parseFloat(a.lat), parseFloat(a.lng)) <= radiusMeters;
  });
}

export async function createAlert(data: {
  userId: string;
  type: "urgency" | "prayer" | "practical_help";
  description: string;
  lat?: string;
  lng?: string;
}) {
  const [created] = await db.insert(samaritanAlert).values(data).returning();
  return created;
}

export async function respondToAlert(alertId: string, userId: string) {
  await db
    .insert(alertResponse)
    .values({ alertId, userId })
    .onConflictDoNothing();
}

export async function resolveAlert(alertId: string, userId: string) {
  await db
    .update(samaritanAlert)
    .set({ status: "resolved" })
    .where(
      and(eq(samaritanAlert.id, alertId), eq(samaritanAlert.userId, userId))
    );
}
