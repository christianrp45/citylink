import { auth } from "@/app/(auth)/auth";
import { getInviteCode, revokeInviteCode, getCommunityById, getChurchById } from "@/lib/db/queries";
import { getCellById } from "@/lib/db/queries-cells";

// GET /api/invite/[code] — pré-visualiza o convite (destino + tipo)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { code } = await params;
  const invite = await getInviteCode(code);

  if (!invite) {
    return Response.json({ error: "Código inválido" }, { status: 404 });
  }

  const now = new Date();
  if (invite.expiresAt && invite.expiresAt < now) {
    return Response.json({ error: "Código expirado" }, { status: 410 });
  }
  if (invite.maxUses != null && invite.usedCount >= invite.maxUses) {
    return Response.json(
      { error: "Código já atingiu o limite de usos" },
      { status: 410 }
    );
  }

  // Buscar nome do destino para exibir no preview
  let targetName = "";
  let targetAvatar: string | null = null;

  try {
    if (invite.type === "cell") {
      const cell = await getCellById(invite.targetId);
      targetName = cell?.name ?? "";
    } else if (invite.type === "community") {
      const community = await getCommunityById(invite.targetId);
      targetName = community?.name ?? "";
      targetAvatar = community?.avatar ?? null;
    } else if (invite.type === "church") {
      const church = await getChurchById(invite.targetId);
      targetName = church?.name ?? "";
    }
  } catch {
    // nome permanece vazio — não bloquear o preview
  }

  return Response.json({
    code: invite.code,
    type: invite.type,
    targetId: invite.targetId,
    targetName,
    targetAvatar,
    role: invite.role,
    expiresAt: invite.expiresAt,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
  });
}

// POST /api/invite/[code]/use — aplica o vínculo (via rota separada abaixo)
// DELETE /api/invite/[code] — revoga o código
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { code } = await params;
  const revoked = await revokeInviteCode(code, session.user.id);

  if (!revoked) {
    return Response.json(
      { error: "Código não encontrado ou sem permissão" },
      { status: 403 }
    );
  }

  return Response.json({ success: true });
}
