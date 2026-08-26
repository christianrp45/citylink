import { auth } from "@/app/(auth)/auth";
import { getUserById, updateUserProfile } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const profile = await getUserById(session.user.id);

  if (!profile) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Não retornar password
  const { password: _pw, ...safeProfile } = profile;

  return Response.json(safeProfile);
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();

  const allowed = [
    "name",
    "phone",
    "profession",
    "avatar",
    "bio",
    "availabilityStatus",
    "lat",
    "lng",
    "birthDate",
    "accountType",
  ] as const;

  type AllowedKey = (typeof allowed)[number];

  const data: Partial<Record<AllowedKey, string>> = {};

  for (const key of allowed) {
    if (key in body && typeof body[key] === "string") {
      data[key] = body[key];
    }
  }

  if (
    data.availabilityStatus &&
    !["mesa-posta", "requer-aviso", "offline"].includes(data.availabilityStatus)
  ) {
    return Response.json(
      { error: "availabilityStatus inválido" },
      { status: 400 }
    );
  }

  if (
    data.accountType &&
    !["individual", "institution"].includes(data.accountType)
  ) {
    return Response.json(
      { error: "accountType inválido" },
      { status: 400 }
    );
  }

  const updated = await updateUserProfile(session.user.id, data as Parameters<typeof updateUserProfile>[1]);

  if (!updated) {
    return Response.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }

  const { password: _pw, ...safeProfile } = updated;

  return Response.json(safeProfile);
}
