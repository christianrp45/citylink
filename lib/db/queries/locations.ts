import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type UserLocation, userLocation } from "../schema";

export async function getUserLocations(userId: string): Promise<UserLocation[]> {
  return db
    .select()
    .from(userLocation)
    .where(eq(userLocation.userId, userId))
    .orderBy(desc(userLocation.createdAt));
}

export async function addUserLocation(
  userId: string,
  data: {
    label: string;
    type: "home" | "work" | "church" | "other";
    lat: string;
    lng: string;
    setActive?: boolean;
  }
): Promise<UserLocation> {
  if (data.setActive) {
    // Desativar todos os anteriores
    await db
      .update(userLocation)
      .set({ isActive: false })
      .where(eq(userLocation.userId, userId));
  }

  const [created] = await db
    .insert(userLocation)
    .values({
      userId,
      label: data.label,
      type: data.type,
      lat: data.lat,
      lng: data.lng,
      isActive: data.setActive ?? false,
    })
    .returning();

  return created;
}

export async function setActiveUserLocation(
  userId: string,
  locationId: string
): Promise<boolean> {
  // Desativar todos
  await db
    .update(userLocation)
    .set({ isActive: false })
    .where(eq(userLocation.userId, userId));

  // Ativar o escolhido
  const result = await db
    .update(userLocation)
    .set({ isActive: true })
    .where(and(eq(userLocation.id, locationId), eq(userLocation.userId, userId)))
    .returning();

  return result.length > 0;
}

export async function deactivateAllUserLocations(userId: string) {
  await db
    .update(userLocation)
    .set({ isActive: false })
    .where(eq(userLocation.userId, userId));
}

export async function deleteUserLocation(
  userId: string,
  locationId: string
): Promise<boolean> {
  const result = await db
    .delete(userLocation)
    .where(and(eq(userLocation.id, locationId), eq(userLocation.userId, userId)))
    .returning();
  return result.length > 0;
}

export async function getActiveUserLocation(
  userId: string
): Promise<UserLocation | null> {
  const [loc] = await db
    .select()
    .from(userLocation)
    .where(and(eq(userLocation.userId, userId), eq(userLocation.isActive, true)))
    .limit(1);
  return loc ?? null;
}
