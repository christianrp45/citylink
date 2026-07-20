import { auth } from "@/app/(auth)/auth";
import { getLeaderDashboard } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const data = await getLeaderDashboard(session.user.id);

  if (!data) {
    return Response.json({ error: "Você não lidera nenhuma célula" }, { status: 403 });
  }

  return Response.json(data);
}
