import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import {
  testimonial,
  cellMember,
  cell,
  userPoints,
} from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";

// Retorna perfil público enriquecido de um usuário (para página /connect/[userId])
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Busca dados enriquecidos em paralelo
  const [lastTestimonial, cells, points] = await Promise.all([
    // Testemunho mais recente
    db
      .select({ id: testimonial.id, title: testimonial.title, content: testimonial.content, createdAt: testimonial.createdAt })
      .from(testimonial)
      .where(eq(testimonial.userId, userId))
      .orderBy(desc(testimonial.createdAt))
      .limit(1)
      .then((rows) => rows[0] ?? null),

    // Células ativas do usuário
    db
      .select({ cellId: cell.id, cellName: cell.name, neighborhood: cell.neighborhood })
      .from(cellMember)
      .innerJoin(cell, eq(cellMember.cellId, cell.id))
      .where(and(eq(cellMember.userId, userId), eq(cellMember.isActive, true)))
      .limit(3),

    // Pontos e nível
    db
      .select({ total: userPoints.total, level: userPoints.level })
      .from(userPoints)
      .where(eq(userPoints.userId, userId))
      .then((rows) => rows[0] ?? null),
  ]);

  const LEVEL_EMOJI: Record<string, string> = {
    semente: "🌱", broto: "🌿", árvore: "🌳", fruto: "🍎", luz: "✨",
  };

  return Response.json({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    profession: user.profession,
    bio: user.bio,
    availabilityStatus: user.availabilityStatus,
    lastTestimonial: lastTestimonial
      ? {
          id: lastTestimonial.id,
          title: lastTestimonial.title,
          excerpt: lastTestimonial.content.slice(0, 120) + (lastTestimonial.content.length > 120 ? "…" : ""),
          createdAt: lastTestimonial.createdAt,
        }
      : null,
    cells: cells.map((c) => ({ id: c.cellId, name: c.cellName, neighborhood: c.neighborhood })),
    level: points
      ? { name: points.level, emoji: LEVEL_EMOJI[points.level] ?? "🌱", total: points.total }
      : null,
  });
}
