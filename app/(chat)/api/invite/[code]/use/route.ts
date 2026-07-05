import { auth } from "@/app/(auth)/auth";
import { useInviteCode } from "@/lib/db/queries";

// POST /api/invite/[code]/use — aplica o vínculo ao usuário autenticado
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { code } = await params;

  try {
    const result = await useInviteCode(code, session.user.id);

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json(result);
  } catch {
    return Response.json({ error: "Erro ao aplicar convite" }, { status: 500 });
  }
}
