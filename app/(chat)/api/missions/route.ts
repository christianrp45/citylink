import { auth } from "@/app/(auth)/auth";
import { getUserMissionsProgress } from "@/lib/gamification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const progress = await getUserMissionsProgress(session.user.id);
  return Response.json(progress);
}
