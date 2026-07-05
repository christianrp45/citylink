import { auth } from "@/app/(auth)/auth";
import { getAcceptedVisitsAsSender } from "@/lib/db/queries";

// GET /api/visits/accepted — visitas que enviei e foram aceitas
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const visits = await getAcceptedVisitsAsSender(session.user.id);
  return Response.json(visits);
}
