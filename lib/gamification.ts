import "server-only";

import { and, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userPoints, userMission, userBadge } from "@/lib/db/schema";
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

// ─── Badges/conquistas — desbloqueio permanente, avaliado a cada missão ────────
export const BADGES = {
  streak_7:     { label: "Uma Semana de Fé",   description: "Manteve a sequência viva por 7 dias seguidos" },
  streak_30:    { label: "Um Mês de Fé",       description: "Manteve a sequência viva por 30 dias seguidos" },
  streak_100:   { label: "Cem Dias Fiel",      description: "Manteve a sequência viva por 100 dias seguidos" },
  missions_25:  { label: "Dedicado",           description: "Completou 25 missões" },
  missions_100: { label: "Veterano da Fé",     description: "Completou 100 missões" },
  host:         { label: "Anfitrião do Reino", description: "Ativou a Mesa Posta pela primeira vez" },
  bridge:       { label: "Ponte",              description: "Trouxe alguém novo para o Emetis" },
  intercessor:  { label: "Intercessor",        description: "Orou por alguém na célula 10 vezes" },
  graduate:     { label: "Graduado",           description: "Concluiu toda a Formação Batista Integrar" },
} as const;

export type BadgeSlug = keyof typeof BADGES;

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

// ─── Streak (sequência de dias) ────────────────────────────────────────────────
// Conta qualquer missão concluída no dia como check-in. Datas em UTC (yyyy-mm-dd).
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.round(
    (new Date(`${a}T00:00:00Z`).getTime() - new Date(`${b}T00:00:00Z`).getTime()) / msPerDay
  );
}

function nextStreak(lastActivityDate: string | null, currentStreak: number): number {
  const today = todayKey();
  if (!lastActivityDate) return 1;
  const diff = daysBetween(today, lastActivityDate);
  if (diff === 0) return currentStreak; // já fez check-in hoje
  if (diff === 1) return currentStreak + 1; // dia seguinte — mantém sequência
  return 1; // quebrou a sequência — recomeça
}

// ─── Avalia e concede badges com base no histórico completo do usuário ─────────
async function checkAndAwardBadges(
  userId: string,
  longestStreak: number
): Promise<BadgeSlug[]> {
  const actionCounts = await db
    .select({ action: userMission.action, count: sql<number>`count(*)`.mapWith(Number) })
    .from(userMission)
    .where(and(eq(userMission.userId, userId), isNotNull(userMission.completedAt)))
    .groupBy(userMission.action);

  const countOf = (action: MissionAction) =>
    actionCounts.find((r) => r.action === action)?.count ?? 0;
  const totalCompleted = actionCounts.reduce((s, r) => s + r.count, 0);

  const earned: BadgeSlug[] = [];
  if (longestStreak >= 7) earned.push("streak_7");
  if (longestStreak >= 30) earned.push("streak_30");
  if (longestStreak >= 100) earned.push("streak_100");
  if (totalCompleted >= 25) earned.push("missions_25");
  if (totalCompleted >= 100) earned.push("missions_100");
  if (countOf("open_hospitality") >= 1) earned.push("host");
  if (countOf("invite_accepted") >= 1) earned.push("bridge");
  if (countOf("pray_for_someone") >= 10) earned.push("intercessor");
  if (countOf("complete_formacao_all") >= 1) earned.push("graduate");

  if (earned.length === 0) return [];

  const owned = await db
    .select({ badge: userBadge.badge })
    .from(userBadge)
    .where(eq(userBadge.userId, userId));
  const ownedSet = new Set(owned.map((o) => o.badge));
  const newBadges = earned.filter((b) => !ownedSet.has(b));

  if (newBadges.length > 0) {
    await db
      .insert(userBadge)
      .values(newBadges.map((badge) => ({ userId, badge })))
      .onConflictDoNothing();
  }

  return newBadges;
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
  const streak = nextStreak(current?.lastActivityDate ?? null, current?.currentStreak ?? 0);
  const longestStreak = Math.max(streak, current?.longestStreak ?? 0);
  const today = todayKey();

  if (current) {
    await db
      .update(userPoints)
      .set({
        total: newTotal,
        level: newLevel,
        currentStreak: streak,
        longestStreak,
        lastActivityDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userPoints.userId, userId));
  } else {
    await db.insert(userPoints).values({
      userId,
      total: newTotal,
      level: newLevel,
      currentStreak: streak,
      longestStreak,
      lastActivityDate: today,
    });
  }

  const newBadges = await checkAndAwardBadges(userId, longestStreak);

  // Push notification de missão concluída (+ conquistas desbloqueadas)
  try {
    const subs = await getUserPushSubscriptions(userId);
    for (const sub of subs) {
      await sendPush(sub, {
        title: `${mission.emoji} Missão concluída! +${mission.points}pts`,
        body: mission.label,
        url: "/missions",
      });
    }
    for (const slug of newBadges) {
      const badge = BADGES[slug];
      for (const sub of subs) {
        await sendPush(sub, {
          title: "🏅 Nova conquista desbloqueada!",
          body: badge.label,
          url: "/missions",
        });
      }
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

  // Sequência "efetiva" pra exibição: se o último check-in não foi hoje nem
  // ontem, a sequência já quebrou (mesmo sem uma nova missão pra recalcular).
  const lastActivityDate = points?.lastActivityDate ?? null;
  const streakBroken = lastActivityDate ? daysBetween(todayKey(), lastActivityDate) > 1 : true;
  const currentStreak = streakBroken ? 0 : (points?.currentStreak ?? 0);

  const owned = await db
    .select({ badge: userBadge.badge, unlockedAt: userBadge.unlockedAt })
    .from(userBadge)
    .where(eq(userBadge.userId, userId));
  const ownedMap = new Map(owned.map((o) => [o.badge, o.unlockedAt]));

  const badges = Object.entries(BADGES).map(([slug, def]) => ({
    slug: slug as BadgeSlug,
    label: def.label,
    description: def.description,
    unlocked: ownedMap.has(slug),
    unlockedAt: ownedMap.get(slug) ?? null,
  }));

  return {
    total,
    level,
    weekPoints,
    nextLevelName: nextLevel?.name ?? null,
    nextLevelMin: nextLevel?.min ?? null,
    missions: allMissions,
    currentStreak,
    longestStreak: points?.longestStreak ?? 0,
    checkedInToday: lastActivityDate === todayKey(),
    badges,
  };
}
