import { auth } from "@/app/(auth)/auth";
import { togglePrayerInteraction, getPrayerRequestCellId, isApprovedCellMember } from "@/lib/db/queries-cells";
import { awardPoints } from "@/lib/gamification";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const cellId = await getPrayerRequestCellId(id);
  if (!cellId || !(await isApprovedCellMember(cellId, session.user.id))) {
    return Response.json({ error: "Você não faz parte desta célula" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const emoji: string = body?.emoji ?? "🙏";

  const result = await togglePrayerInteraction(id, session.user.id, emoji);

  if (result?.praying) void awardPoints(session.user.id, "pray_for_someone");

  return Response.json(result);
}
