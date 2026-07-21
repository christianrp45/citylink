import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { awardPoints } from "@/lib/gamification";

// POST /api/users/referral  { code: "ABC1234" }
// Chamado logo após o registro para vincular quem indicou e dar pontos ao indicador
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return Response.json({ error: "Código inválido" }, { status: 400 });
  }

  // Busca o dono do código
  const [referrer] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.personalInviteCode, code.toUpperCase().trim()));

  if (!referrer) {
    return Response.json({ error: "Código não encontrado" }, { status: 404 });
  }

  if (referrer.id === session.user.id) {
    return Response.json({ error: "Você não pode usar seu próprio código" }, { status: 400 });
  }

  // Verifica se já tem referredBy (evita duplo registro)
  const [me] = await db
    .select({ referredBy: user.referredBy })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (me?.referredBy) {
    return Response.json({ error: "Convite já registrado" }, { status: 409 });
  }

  // Salva quem indicou o novo usuário
  await db.update(user)
    .set({ referredBy: referrer.id })
    .where(eq(user.id, session.user.id));

  // Dá pontos a quem indicou (missão semanal)
  void awardPoints(referrer.id, "invite_accepted");

  return Response.json({ success: true });
}
