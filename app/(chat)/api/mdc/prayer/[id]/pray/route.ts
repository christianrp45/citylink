import { auth } from "@/app/(auth)/auth";
import { togglePrayerInteraction } from "@/lib/db/queries-cells";
import { awardPoints } from "@/lib/gamification";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const result = await togglePrayerInteraction(id, session.user.id);

  if (result?.praying) void awardPoints(session.user.id, "pray_for_someone");

  return Response.json(result);
}
