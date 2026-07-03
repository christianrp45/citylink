import { auth } from "@/app/(auth)/auth";
import { togglePrayerInteraction } from "@/lib/db/queries-cells";

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

  return Response.json(result);
}
