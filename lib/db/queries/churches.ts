import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { church, churchAdmin, user } from "../schema";

export async function getChurches() {
  return db.select().from(church).orderBy(asc(church.name));
}

export async function getChurchById(id: string) {
  const [row] = await db.select().from(church).where(eq(church.id, id));
  return row ?? null;
}

/** Admin original (owner) OU co-admin cadastrado em ChurchAdmin. */
export async function isChurchAdmin(churchId: string, userId: string): Promise<boolean> {
  const ch = await getChurchById(churchId);
  if (!ch) return false;
  if (ch.adminUserId === userId) return true;

  const [row] = await db
    .select()
    .from(churchAdmin)
    .where(and(eq(churchAdmin.churchId, churchId), eq(churchAdmin.userId, userId)));
  return !!row;
}

export async function getChurchAdmins(churchId: string) {
  return db
    .select({ id: user.id, name: user.name, email: user.email, avatar: user.avatar })
    .from(churchAdmin)
    .innerJoin(user, eq(churchAdmin.userId, user.id))
    .where(eq(churchAdmin.churchId, churchId));
}

/** Adiciona co-admin — quem chama já deve ter sido validado como admin da igreja. */
export async function addChurchAdmin(churchId: string, userId: string) {
  await db
    .insert(churchAdmin)
    .values({ churchId, userId })
    .onConflictDoNothing();
}

/** Remove co-admin. Não afeta o owner (adminUserId), que não vive nesta tabela. */
export async function removeChurchAdmin(churchId: string, userId: string) {
  await db
    .delete(churchAdmin)
    .where(and(eq(churchAdmin.churchId, churchId), eq(churchAdmin.userId, userId)));
}

// Lista membros da igreja (users com primaryChurchId = churchId)
export async function getChurchMembers(churchId: string) {
  return db
    .select({ id: user.id, name: user.name, email: user.email, avatar: user.avatar, profession: user.profession })
    .from(user)
    .where(eq(user.primaryChurchId, churchId))
    .orderBy(asc(user.name));
}

// Adiciona membro diretamente (seta primaryChurchId)
export async function addChurchMember(churchId: string, userId: string) {
  await db.update(user).set({ primaryChurchId: churchId }).where(eq(user.id, userId));
}

// Remove membro (limpa primaryChurchId)
export async function removeChurchMember(userId: string) {
  await db.update(user).set({ primaryChurchId: null }).where(eq(user.id, userId));
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
