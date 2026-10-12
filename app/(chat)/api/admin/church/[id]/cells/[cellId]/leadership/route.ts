import { auth } from "@/app/(auth)/auth";
import {
  getCellById,
  getUserById,
  isChurchAdmin,
  setCellLeadership,
} from "@/lib/db/queries";

// PATCH — troca líder e/ou co-líder de uma célula da igreja { leaderId?, coLeaderId? }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; cellId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { id, cellId } = await params;
  if (!(await isChurchAdmin(id, session.user.id))) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const cell = await getCellById(cellId);
  if (!cell || cell.churchId !== id) {
    return Response.json({ error: "Célula não encontrada nesta igreja" }, { status: 404 });
  }

  const body = await request.json();
  const { leaderId, coLeaderId } = body;

  if (!leaderId && coLeaderId === undefined) {
    return Response.json({ error: "Informe leaderId ou coLeaderId" }, { status: 400 });
  }

  if (leaderId) {
    const leader = await getUserById(leaderId);
    if (!leader || leader.primaryChurchId !== id) {
      return Response.json({ error: "O líder precisa ser membro desta igreja" }, { status: 400 });
    }
  }
  if (coLeaderId) {
    const coLeader = await getUserById(coLeaderId);
    if (!coLeader || coLeader.primaryChurchId !== id) {
      return Response.json({ error: "O co-líder precisa ser membro desta igreja" }, { status: 400 });
    }
  }

  const updated = await setCellLeadership(cellId, {
    leaderId: leaderId || undefined,
    coLeaderId: coLeaderId === null ? null : coLeaderId || undefined,
  });

  return Response.json(updated);
}
