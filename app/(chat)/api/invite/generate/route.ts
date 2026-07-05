import { auth } from "@/app/(auth)/auth";
import { generateInviteCode, getCommunityById, getChurchById } from "@/lib/db/queries";
import { getCellById } from "@/lib/db/queries-cells";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const { type, targetId, role, maxUses, expiresInDays } =
    await request.json();

  if (!type || !targetId) {
    return Response.json(
      { error: "type e targetId são obrigatórios" },
      { status: 400 }
    );
  }

  if (!["church", "cell", "community"].includes(type)) {
    return Response.json({ error: "type inválido" }, { status: 400 });
  }

  // Verificar se o usuário tem permissão para gerar convite para esse destino
  try {
    if (type === "cell") {
      const cell = await getCellById(targetId);
      if (!cell) {
        return Response.json({ error: "Célula não encontrada" }, { status: 404 });
      }
      if (cell.leaderId !== userId && cell.coLeaderId !== userId) {
        return Response.json(
          { error: "Apenas o líder ou co-líder podem gerar convites para a célula" },
          { status: 403 }
        );
      }
    } else if (type === "community") {
      const community = await getCommunityById(targetId);
      if (!community) {
        return Response.json({ error: "Comunidade não encontrada" }, { status: 404 });
      }
      if (community.adminUserId !== userId) {
        return Response.json(
          { error: "Apenas o administrador pode gerar convites para a comunidade" },
          { status: 403 }
        );
      }
    } else if (type === "church") {
      const church = await getChurchById(targetId);
      if (!church) {
        return Response.json({ error: "Igreja não encontrada" }, { status: 404 });
      }
      if (church.adminUserId !== userId) {
        return Response.json(
          { error: "Apenas o administrador pode gerar convites para a igreja" },
          { status: 403 }
        );
      }
    }
  } catch {
    return Response.json({ error: "Erro ao verificar permissão" }, { status: 500 });
  }

  try {
    const invite = await generateInviteCode({
      type,
      targetId,
      createdBy: userId,
      role: role ?? "member",
      maxUses: maxUses ?? undefined,
      expiresInDays: expiresInDays !== undefined ? expiresInDays : 7,
    });

    return Response.json(invite, { status: 201 });
  } catch {
    return Response.json({ error: "Erro ao gerar código" }, { status: 500 });
  }
}
