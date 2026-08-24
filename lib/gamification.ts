import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userPoints, userMission } from "@/lib/db/schema";
import { getUserPushSubscriptions } from "@/lib/db/queries";
import { sendPush } from "@/lib/push";

// ─── Missões disponíveis ───────────────────────────────────────────────────────
export const MISSIONS = {
  attend_meeting:      { label: "Participe de uma reunião de célula",  points: 40, emoji: "🏠" },
  bible_highlight:     { label: "Faça um destaque na Bíblia",          points: 15, emoji: "✨" },
  reading_plan:        { label: "Avance no plano de leitura",          points: 25, emoji: "📖" },
  send_visit:          { label: "Solicite uma visita a alguém",        points: 30, emoji: "🚗" },
  accept_visit:        { label: "Aceite um visitante",                 points: 50, emoji: "🤝" },
  offer_talent:        { label: "Ofereça um talento na comunidade",    points: 20, emoji: "🎁" },
  share_testimony:     { label: "Compartilhe um testemunho",           points: 25, emoji: "💬" },
  encourage_someone:   { label: "Envie uma mensagem de encorajamento", points: 10, emoji: "💌" },
  open_hospitality:    { label: "Ative a Mesa Posta",                  points: 30, emoji: "🍽️" },
  pray_for_someone:    { label: "Ore por alguém na célula",            points: 20, emoji: "🙏" },
  join_group:          { label: "Entre em uma célula ou comunidade",   points: 30, emoji: "👥" },
  invite_accepted:     { label: "Convide alguém que entrou no Emetis", points: 50, emoji: "🎉" },
  complete_formacao_lesson:  { label: "Conclua uma lição da Série Integrar",      points: 20, emoji: "📚" },
  complete_formacao_caderno: { label: "Conclua um caderno da Série Integrar",     points: 80, emoji: "🎓" },
  complete_formacao_all:     { label: "Conclua toda a Formação Batista Integrar", points: 300, emoji: "🏆" },
} as const;

export type MissionAction = keyof typeof MISSIONS;

// ─── Níveis ───────────────────────────────────────────────────────────────────
const LEVELS = [
  { name: "semente",  min: 0   },
  { name: "broto",    min: 100 },
  { name: "árvore",   min: 300 },
  { name: "fruto",    min: 600 },
  { name: "luz",      min: 1000},
] as const;

function calcLevel(total: number): string {
  let level = "semente";
  for (const l of LEVELS) {
    if (total >= l.min) level = l.name;
  }
  return level;
}

// ─── Chave de semana ISO (ex: "2026-W30") ─────────────────────────────────────
export function currentWeekKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const week = Math.ceil((dayOfYear + startOfYear.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// ─── Função principal: conceder pontos ────────────────────────────────────────
export async function awardPoints(userId: string, action: MissionAction): Promise<void> {
  const mission = MISSIONS[action];
  if (!mission) return;

  const weekKey = currentWeekKey();

  // Verifica se a missão já foi concluída nesta semana
  const [existing] = await db
    .select()
    .from(userMission)
    .where(
      and(
        eq(userMission.userId, userId),
        eq(userMission.action, action),
        eq(userMission.weekKey, weekKey)
      )
    );

  if (existing?.completedAt) return; // já concluída esta semana

  // Marca a missão como concluída
  if (existing) {
    await db
      .update(userMission)
      .set({ completedAt: new Date(), pointsAwarded: mission.points })
      .where(eq(userMission.id, existing.id));
  } else {
    await db.insert(userMission).values({
      userId,
      action,
      weekKey,
      completedAt: new Date(),
      pointsAwarded: mission.points,
    });
  }

  // Atualiza total de pontos e nível
  const [current] = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId));

  const newTotal = (current?.total ?? 0) + mission.points;
  const newLevel = calcLevel(newTotal);

  if (current) {
    await db
      .update(userPoints)
      .set({ total: newTotal, level: newLevel, updatedAt: new Date() })
      .where(eq(userPoints.userId, userId));
  } else {
    await db.insert(userPoints).values({
      userId,
      total: newTotal,
      level: newLevel,
    });
  }

  // Push notification de missão concluída
  try {
    const subs = await getUserPushSubscriptions(userId);
    for (const sub of subs) {
      await sendPush(sub, {
        title: `${mission.emoji} Missão concluída! +${mission.points}pts`,
        body: mission.label,
        url: "/profile",
      });
    }
  } catch {
    // push não é crítico
  }
}

// ─── Buscar progresso do usuário ──────────────────────────────────────────────
export async function getUserMissionsProgress(userId: string) {
  const weekKey = currentWeekKey();

  const [points] = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId));

  const weekMissions = await db
    .select()
    .from(userMission)
    .where(
      and(
        eq(userMission.userId, userId),
        eq(userMission.weekKey, weekKey)
      )
    );

  const completedActions = new Set(
    weekMissions.filter((m) => m.completedAt).map((m) => m.action)
  );

  const allMissions = Object.entries(MISSIONS).map(([action, def]) => ({
    action,
    label: def.label,
    points: def.points,
    emoji: def.emoji,
    completed: completedActions.has(action),
  }));

  const weekPoints = weekMissions.reduce((s, m) => s + (m.pointsAwarded ?? 0), 0);
  const total = points?.total ?? 0;
  const level = points?.level ?? "semente";
  const nextLevel = LEVELS.find((l) => l.min > total);

  return {
    total,
    level,
    weekPoints,
    nextLevelName: nextLevel?.name ?? null,
    nextLevelMin: nextLevel?.min ?? null,
    missions: allMissions,
  };
}
