import { auth } from "@/app/(auth)/auth";
import {
  createCell,
  getCellMemberCount,
  getCells,
} from "@/lib/db/queries-cells";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  const communityId = url.searchParams.get('communityId') ?? undefined;

  const cells = await getCells(communityId ? { communityId } : undefined);

  const withCount = await Promise.all(
    cells.map(async (c) => ({
      ...c,
      memberCount: await getCellMemberCount(c.id),
    }))
  );

  return Response.json(withCount);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (session.user.type === "guest") {
    return Response.json({ error: "Faça login para criar um grupo" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, communityId, neighborhood, address, meetingDay, meetingTime, targetAudience, maxMembers } = body;

  if (!name?.trim()) {
    return Response.json({ error: "Nome do grupo é obrigatório" }, { status: 400 });
  }

  const newCell = await createCell({
    name,
    description,
    communityId: typeof communityId === 'string' ? communityId : undefined,
    leaderId: session.user.id,
    neighborhood,
    address,
    meetingDay,
    meetingTime,
    targetAudience: targetAudience ?? "misto",
    maxMembers: maxMembers ?? 15,
  });

  return Response.json(newCell, { status: 201 });
}
