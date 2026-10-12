import { auth } from "@/app/(auth)/auth";
import {
  createCell,
  getCellMemberCount,
  getCells,
  getUserById,
  isChurchAdmin,
} from "@/lib/db/queries";

// GET — lista células da igreja
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  if (!(await isChurchAdmin(id, session.user.id))) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const cells = await getCells({ churchId: id });
  const withCount = await Promise.all(
    cells.map(async (c) => ({ ...c, memberCount: await getCellMemberCount(c.id) }))
  );

  return Response.json(withCount);
}

// POST — cria célula vinculada à igreja, já escolhendo líder (e opcionalmente co-líder)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  if (!(await isChurchAdmin(id, session.user.id))) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const {
    name,
    description,
    leaderId,
    coLeaderId,
    neighborhood,
    address,
    meetingDay,
    meetingTime,
    targetAudience,
    maxMembers,
    entryMode,
  } = body;

  if (!name?.trim()) {
    return Response.json({ error: "Nome da célula é obrigatório" }, { status: 400 });
  }
  if (!leaderId) {
    return Response.json({ error: "Escolha um líder" }, { status: 400 });
  }

  const leader = await getUserById(leaderId);
  if (!leader || leader.primaryChurchId !== id) {
    return Response.json({ error: "O líder precisa ser membro desta igreja" }, { status: 400 });
  }
  if (coLeaderId) {
    const coLeader = await getUserById(coLeaderId);
    if (!coLeader || coLeader.primaryChurchId !== id) {
      return Response.json({ error: "O co-líder precisa ser membro desta igreja" }, { status: 400 });
    }
  }

  const newCell = await createCell({
    name,
    description,
    churchId: id,
    leaderId,
    coLeaderId: coLeaderId || undefined,
    neighborhood,
    address,
    meetingDay,
    meetingTime,
    targetAudience: targetAudience ?? "misto",
    maxMembers: maxMembers ?? 15,
    entryMode: entryMode === "open" ? "open" : "invite_only",
  });

  return Response.json(newCell, { status: 201 });
}
