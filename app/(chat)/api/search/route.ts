// GET /api/search?q=termo — busca global em pessoas, células, comunidades e eventos

import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { user, cell, community, event } from "@/lib/db/schema";
import { ilike, or, and, eq, gte } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return Response.json({ users: [], cells: [], communities: [], events: [] });
  }

  const pattern = `%${q}%`;

  const [users, cells, communities, events] = await Promise.all([
    // Pessoas
    db
      .select({ id: user.id, name: user.name, avatar: user.avatar, profession: user.profession, availabilityStatus: user.availabilityStatus })
      .from(user)
      .where(or(ilike(user.name, pattern), ilike(user.profession, pattern)))
      .limit(8),

    // Células
    db
      .select({ id: cell.id, name: cell.name, neighborhood: cell.neighborhood, description: cell.description, targetAudience: cell.targetAudience, isOpen: cell.isOpen })
      .from(cell)
      .where(or(ilike(cell.name, pattern), ilike(cell.neighborhood, pattern), ilike(cell.description, pattern)))
      .limit(6),

    // Comunidades
    db
      .select({ id: community.id, name: community.name, description: community.description, type: community.type, avatar: community.avatar })
      .from(community)
      .where(and(eq(community.isPublic, true), or(ilike(community.name, pattern), ilike(community.description, pattern))))
      .limit(6),

    // Eventos futuros
    db
      .select({ id: event.id, title: event.title, type: event.type, address: event.address, date: event.date, organizerName: user.name })
      .from(event)
      .leftJoin(user, eq(event.organizerId, user.id))
      .where(and(gte(event.date, new Date()), or(ilike(event.title, pattern), ilike(event.description, pattern), ilike(event.address, pattern))))
      .limit(6),
  ]);

  return Response.json({ users, cells, communities, events });
}
