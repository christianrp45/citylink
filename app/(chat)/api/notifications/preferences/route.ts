// GET  /api/notifications/preferences — return push preference toggles
// PATCH /api/notifications/preferences — update push preference toggles

import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db/client';
import { userPrivacySettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [row] = await db
    .select({
      pushVisits: userPrivacySettings.pushVisits,
      pushMessages: userPrivacySettings.pushMessages,
      pushFriendRequests: userPrivacySettings.pushFriendRequests,
      pushMissions: userPrivacySettings.pushMissions,
    })
    .from(userPrivacySettings)
    .where(eq(userPrivacySettings.userId, session.user.id));

  // Return defaults if no row yet
  return Response.json(
    row ?? {
      pushVisits: true,
      pushMessages: true,
      pushFriendRequests: true,
      pushMissions: true,
    }
  );
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ['pushVisits', 'pushMessages', 'pushFriendRequests', 'pushMissions'] as const;
  const updates: Partial<Record<(typeof allowed)[number], boolean>> = {};
  for (const key of allowed) {
    if (typeof body[key] === 'boolean') updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  await db
    .insert(userPrivacySettings)
    .values({ userId: session.user.id, ...updates })
    .onConflictDoUpdate({
      target: userPrivacySettings.userId,
      set: { ...updates, updatedAt: new Date() },
    });

  return Response.json({ ok: true });
}
