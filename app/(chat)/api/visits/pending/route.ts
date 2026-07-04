import { auth } from "@/app/(auth)/auth";
import { getPendingVisitRequests } from "@/lib/db/queries";

// GET /api/visits/pending — visitas pendentes para mim
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const pending = await getPendingVisitRequests(session.user.id);
  return Response.json(pending);
}
