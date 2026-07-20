import { auth } from "@/app/(auth)/auth";
import { READING_PLANS } from "@/lib/reading-plans";
import { awardPoints } from "@/lib/gamification";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readingPlanProgress } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// GET — retorna planos + progresso do usuário
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const progresses = await db
    .select()
    .from(readingPlanProgress)
    .where(eq(readingPlanProgress.userId, session.user.id));

  const plans = READING_PLANS.map((plan) => {
    const prog = progresses.find((p) => p.planSlug === plan.slug);
    const completedDays = (prog?.completedDays as number[]) ?? [];
    return {
      slug: plan.slug,
      title: plan.title,
      description: plan.description,
      emoji: plan.emoji,
      totalDays: plan.totalDays,
      enrolled: !!prog,
      completedDays,
      percentComplete: Math.round((completedDays.length / plan.totalDays) * 100),
      currentDay: completedDays.length + 1,
      startedAt: prog?.startedAt ?? null,
    };
  });

  return Response.json(plans);
}

// POST — enrola no plano ou marca dia como concluído
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { slug, markDay } = await request.json();

  const plan = READING_PLANS.find((p) => p.slug === slug);
  if (!plan) {
    return Response.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  const [existing] = await db
    .select()
    .from(readingPlanProgress)
    .where(
      and(
        eq(readingPlanProgress.userId, session.user.id),
        eq(readingPlanProgress.planSlug, slug)
      )
    );

  if (!existing) {
    // Enrolar no plano
    const [created] = await db
      .insert(readingPlanProgress)
      .values({
        userId: session.user.id,
        planSlug: slug,
        completedDays: markDay ? [markDay] : [],
        lastReadAt: markDay ? new Date() : null,
      })
      .returning();
    return Response.json(created, { status: 201 });
  }

  if (markDay) {
    const completed = (existing.completedDays as number[]) ?? [];
    const updated = Array.from(new Set([...completed, markDay])).sort((a, b) => a - b);
    const [result] = await db
      .update(readingPlanProgress)
      .set({ completedDays: updated, lastReadAt: new Date() })
      .where(
        and(
          eq(readingPlanProgress.userId, session.user.id),
          eq(readingPlanProgress.planSlug, slug)
        )
      )
      .returning();

    void awardPoints(session.user.id, "reading_plan");
    return Response.json(result);
  }

  return Response.json(existing);
}
