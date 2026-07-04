import { auth } from "@/app/(auth)/auth";
import { getConversations } from "@/lib/db/queries";

// GET /api/messages — lista de conversas com última mensagem de cada
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const conversations = await getConversations(session.user.id);
  return Response.json(conversations);
}
