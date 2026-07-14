import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { church } from "../schema";

export async function getChurches() {
  return db.select().from(church).orderBy(asc(church.name));
}

export async function getChurchById(id: string) {
  const [row] = await db.select().from(church).where(eq(church.id, id));
  return row ?? null;
}

export async function createChurch(data: {
  name: string;
  denomination?: string;
  description?: string;
  address?: string;
  lat?: string;
  lng?: string;
  phone?: string;
  schedule?: string;
  pastor?: string;
  members?: number;
  adminUserId: string;
}) {
  const [created] = await db.insert(church).values(data).returning();
  return created;
}
