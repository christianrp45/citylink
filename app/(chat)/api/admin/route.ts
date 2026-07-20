import { auth } from "@/app/(auth)/auth";
import { getAdminDashboard } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const data = await getAdminDashboard(session.user.id);
  if (!data) {
    return Response.json({ error: "Sem acesso de administrador" }, { status: 403 });
  }

  return Response.json(data);
}
