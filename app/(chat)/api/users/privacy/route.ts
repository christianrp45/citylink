import { auth } from "@/app/(auth)/auth";
import {
  getUserPrivacySettings,
  upsertUserPrivacySettings,
  logConsent,
} from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const settings = await getUserPrivacySettings(session.user.id);
  return Response.json(settings ?? { userId: session.user.id });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const validFields = [
    "consentDataProcessing",
    "consentLocation",
    "consentProximityAlerts",
    "consentVisitRequests",
    "consentProfileVisible",
  ] as const;

  type ConsentField = (typeof validFields)[number];
  const moduleMap: Record<ConsentField, string> = {
    consentDataProcessing: "data_processing",
    consentLocation: "location",
    consentProximityAlerts: "proximity",
    consentVisitRequests: "visit_requests",
    consentProfileVisible: "profile",
  };

  const data: Partial<Record<ConsentField, boolean>> = {};
  const ip = request.headers.get("x-forwarded-for") ?? undefined;
  const ua = request.headers.get("user-agent") ?? undefined;

  for (const field of validFields) {
    if (field in body && typeof body[field] === "boolean") {
      data[field] = body[field];
      // Auditoria LGPD — INSERT ONLY
      await logConsent({
        userId: session.user.id,
        module: moduleMap[field],
        action: body[field] ? "granted" : "revoked",
        ipAddress: ip,
        userAgent: ua,
      });
    }
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nenhum campo válido enviado" }, { status: 400 });
  }

  const updated = await upsertUserPrivacySettings(session.user.id, data);
  return Response.json(updated);
}
