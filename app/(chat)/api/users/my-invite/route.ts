import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// GET /api/users/my-invite — retorna (ou gera) o código pessoal de convite do usuário
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [me] = await db.select({ personalInviteCode: user.personalInviteCode })
    .from(user)
    .where(eq(user.id, session.user.id));

  if (me?.personalInviteCode) {
    return Response.json({ code: me.personalInviteCode });
  }

  // Gera novo código único
  let code = genCode();
  let attempts = 0;
  while (attempts < 5) {
    try {
      await db.update(user)
        .set({ personalInviteCode: code })
        .where(eq(user.id, session.user.id));
      break;
    } catch {
      code = genCode();
      attempts++;
    }
  }

  return Response.json({ code });
}
