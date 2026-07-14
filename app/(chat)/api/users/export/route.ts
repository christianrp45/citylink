import { auth } from "@/app/(auth)/auth";
import {
  getUserById,
  getFriends,
  getPendingVisitRequests,
  getUserPrivacySettings,
  getUserVisibilityConfig,
  getUserProximityConfig,
  getMyCommunityIds,
} from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  // Coleta todos os dados do usuário em paralelo
  const [profile, friends, pendingVisits, privacy, visibility, proximity, communityIds] =
    await Promise.all([
      getUserById(userId),
      getFriends(userId),
      getPendingVisitRequests(userId),
      getUserPrivacySettings(userId),
      getUserVisibilityConfig(userId),
      getUserProximityConfig(userId),
      getMyCommunityIds(userId),
    ]);

  if (!profile) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Remove campos sensíveis
  const { password: _pw, ...safeProfile } = profile;

  const exportData = {
    exportedAt: new Date().toISOString(),
    exportVersion: "1.0",
    legalBasis: "LGPD art. 18 — Direito de acesso e portabilidade de dados",
    profile: safeProfile,
    privacySettings: privacy,
    visibilityConfig: visibility,
    proximityConfig: proximity
      ? {
          isActive: proximity.isActive,
          radiusMeters: proximity.radiusMeters,
          activeWhen: proximity.activeWhen,
          locationExpiresHours: proximity.locationExpiresHours,
          cooldownMinutes: proximity.cooldownMinutes,
          // lastLocationAt omitido — dado de localização não é exportado por segurança
        }
      : null,
    socialData: {
      friendCount: friends.length,
      friends: friends.map((f) => ({
        id: f.id,
        name: f.name,
        profession: f.profession,
      })),
      pendingVisitRequests: pendingVisits.map((v) => ({
        id: v.id,
        message: v.message,
        createdAt: v.createdAt,
      })),
      communityIds,
    },
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="emetis-dados-${userId.slice(0, 8)}.json"`,
    },
  });
}
