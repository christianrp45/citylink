import { auth } from "@/app/(auth)/auth";
import { searchUsers } from "@/lib/db/queries";

// GET /api/users/search?q=nome — busca usuários por nome ou e-mail
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json([]);
  }

  const results = await searchUsers(q, session.user.id, 20);
  return Response.json(results);
}
