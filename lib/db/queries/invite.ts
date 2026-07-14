import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cellMember, communityMember, inviteCode, user } from "../schema";

function randomInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 7 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function generateInviteCode({
  type,
  targetId,
  createdBy,
  role = "member",
  maxUses,
  expiresInDays = 7,
}: {
  type: "church" | "cell" | "community";
  targetId: string;
  createdBy: string;
  role?: string;
  maxUses?: number;
  expiresInDays?: number | null;
}) {
  const code = randomInviteCode();
  const expiresAt =
    expiresInDays != null
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

  const [row] = await db
    .insert(inviteCode)
    .values({
      code,
      type,
      targetId,
      createdBy,
      role: role as "member" | "leader" | "co-leader" | "visitor" | "admin" | "moderator",
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ?? undefined,
    })
    .returning();
  return row;
}

export async function getInviteCode(code: string) {
  const [row] = await db
    .select()
    .from(inviteCode)
    .where(eq(inviteCode.code, code.toUpperCase()));
  return row ?? null;
}

export async function useInviteCode(code: string, userId: string) {
  const invite = await getInviteCode(code);
  if (!invite) return { error: "Código não encontrado" } as const;

  const now = new Date();
  if (invite.expiresAt && invite.expiresAt < now) {
    return { error: "Código expirado" } as const;
  }
  if (invite.maxUses != null && invite.usedCount >= invite.maxUses) {
    return { error: "Código já atingiu o limite de usos" } as const;
  }

  // Aplicar vínculo conforme o tipo
  if (invite.type === "cell") {
    await db
      .insert(cellMember)
      .values({
        cellId: invite.targetId,
        userId,
        role: (invite.role as "member" | "leader" | "co-leader" | "visitor") ?? "member",
      })
      .onConflictDoNothing();
  } else if (invite.type === "community") {
    await db
      .insert(communityMember)
      .values({
        communityId: invite.targetId,
        userId,
        role: (invite.role as "owner" | "admin" | "moderator" | "member") ?? "member",
        approvedAt: new Date(),
      })
      .onConflictDoNothing();
  } else if (invite.type === "church") {
    await db
      .update(user)
      .set({ primaryChurchId: invite.targetId })
      .where(eq(user.id, userId));
  }

  // Incrementar usedCount
  await db
    .update(inviteCode)
    .set({ usedCount: invite.usedCount + 1 })
    .where(eq(inviteCode.id, invite.id));

  return { success: true, type: invite.type, targetId: invite.targetId } as const;
}

export async function revokeInviteCode(code: string, requesterId: string) {
  const invite = await getInviteCode(code);
  if (!invite) return false;
  if (invite.createdBy !== requesterId) return false;

  await db.delete(inviteCode).where(eq(inviteCode.id, invite.id));
  return true;
}

export async function getInvitesByTarget(
  type: "church" | "cell" | "community",
  targetId: string
) {
  return db
    .select()
    .from(inviteCode)
    .where(
      and(eq(inviteCode.type, type), eq(inviteCode.targetId, targetId))
    )
    .orderBy(desc(inviteCode.createdAt));
}
