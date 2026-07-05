import { auth } from "@/app/(auth)/auth";
import { getUserProximityConfig, upsertUserProximityConfig } from "@/lib/db/queries";

type ActiveWhenOption = "same_city" | "same_state" | "same_country" | "always" | "never";
const VALID_ACTIVE_WHEN: ActiveWhenOption[] = [
  "same_city", "same_state", "same_country", "always", "never",
];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const config = await getUserProximityConfig(session.user.id);
  return Response.json(config ?? { userId: session.user.id });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const data: Parameters<typeof upsertUserProximityConfig>[1] = {};

  const boolFields = [
    "isActive",
    "notifyWhenFriendNear",
    "notifyWhenCellMemberNear",
    "notifyWhenCommunityNear",
  ] as const;

  const numFields = ["radiusMeters", "locationExpiresHours", "cooldownMinutes"] as const;

  for (const field of boolFields) {
    if (field in body && typeof body[field] === "boolean") {
      data[field] = body[field];
    }
  }

  for (const field of numFields) {
    if (field in body && typeof body[field] === "number") {
      data[field] = body[field];
    }
  }

  if ("activeWhen" in body) {
    if (!VALID_ACTIVE_WHEN.includes(body.activeWhen)) {
      return Response.json(
        { error: `activeWhen inválido. Valores: ${VALID_ACTIVE_WHEN.join(", ")}` },
        { status: 400 }
      );
    }
    data.activeWhen = body.activeWhen as ActiveWhenOption;
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nenhum campo válido enviado" }, { status: 400 });
  }

  // LGPD: radiusMeters mínimo 100m, máximo 50km
  if (data.radiusMeters !== undefined) {
    data.radiusMeters = Math.max(100, Math.min(50000, data.radiusMeters));
  }
  // LGPD: locationExpiresHours máximo 24h
  if (data.locationExpiresHours !== undefined) {
    data.locationExpiresHours = Math.max(1, Math.min(24, data.locationExpiresHours));
  }

  await upsertUserProximityConfig(session.user.id, data);
  const updated = await getUserProximityConfig(session.user.id);
  return Response.json(updated);
}
