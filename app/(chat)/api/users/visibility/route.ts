import { auth } from "@/app/(auth)/auth";
import { getUserVisibilityConfig, upsertUserVisibilityConfig } from "@/lib/db/queries";

type VisibilityOption = "nobody" | "friends" | "my_community" | "all";
const VALID_OPTIONS: VisibilityOption[] = ["nobody", "friends", "my_community", "all"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const config = await getUserVisibilityConfig(session.user.id);
  return Response.json(config ?? { userId: session.user.id });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const validFields = ["locationVisibleTo", "visitRequestFrom", "chatFrom", "profileVisibleTo"] as const;

  const data: Partial<Record<(typeof validFields)[number], VisibilityOption>> = {};
  for (const field of validFields) {
    if (field in body) {
      if (!VALID_OPTIONS.includes(body[field])) {
        return Response.json(
          { error: `${field} inválido. Valores: ${VALID_OPTIONS.join(", ")}` },
          { status: 400 }
        );
      }
      data[field] = body[field] as VisibilityOption;
    }
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Nenhum campo válido enviado" }, { status: 400 });
  }

  await upsertUserVisibilityConfig(session.user.id, data);
  const updated = await getUserVisibilityConfig(session.user.id);
  return Response.json(updated);
}
