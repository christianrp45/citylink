import { auth } from "@/app/(auth)/auth";
import {
  addChurchAdmin,
  getChurchAdmins,
  getChurchById,
  getUserById,
  isChurchAdmin,
} from "@/lib/db/queries";

// GET — lista admins da igreja (owner + co-admins)
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

  const church = await getChurchById(id);
  const coAdmins = await getChurchAdmins(id);
  const owner = church?.adminUserId ? await getUserById(church.adminUserId) : null;

  return Response.json({
    owner: owner ? { id: owner.id, name: owner.name, email: owner.email, avatar: owner.avatar } : null,
    coAdmins,
  });
}

// POST — adiciona co-admin { userId }
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

  const { userId } = await request.json();
  if (!userId) return Response.json({ error: "userId obrigatório" }, { status: 400 });

  const target = await getUserById(userId);
  if (!target || target.primaryChurchId !== id) {
    return Response.json({ error: "O novo admin precisa ser membro desta igreja" }, { status: 400 });
  }

  await addChurchAdmin(id, userId);
  return Response.json({ ok: true });
}
