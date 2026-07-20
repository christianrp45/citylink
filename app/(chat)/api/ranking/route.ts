import { auth } from "@/app/(auth)/auth";
import { getLeaderboard } from "@/lib/db/queries";
import { NextRequest } from "next/server";

// GET /api/ranking?cellId=xxx  (cellId opcional — sem ele retorna ranking global)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const cellId = req.nextUrl.searchParams.get("cellId") ?? undefined;
  const entries = await getLeaderboard(cellId);
  return Response.json(entries);
}
