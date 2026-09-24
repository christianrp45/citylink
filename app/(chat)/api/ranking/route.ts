import { auth } from "@/app/(auth)/auth";
import { getLeaderboard, getWeeklyLeaderboard } from "@/lib/db/queries";
import { currentWeekKey } from "@/lib/gamification";
import { NextRequest } from "next/server";

// GET /api/ranking?cellId=xxx&period=week
// cellId opcional — sem ele retorna ranking global.
// period=week retorna o ranking só desta semana (reseta toda semana); default é acumulado (total).
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const cellId = req.nextUrl.searchParams.get("cellId") ?? undefined;
  const period = req.nextUrl.searchParams.get("period");

  const entries =
    period === "week"
      ? await getWeeklyLeaderboard(currentWeekKey(), cellId)
      : await getLeaderboard(cellId);

  return Response.json(entries);
}
