import { auth } from "@/app/(auth)/auth";
import {
  createCell,
  getCellMemberCount,
  getCells,
} from "@/lib/db/queries-cells";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const cells = await getCells();

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
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, neighborhood, address, meetingDay, meetingTime, targetAudience, maxMembers } = body;

  if (!name) {
    return Response.json({ error: "Nome da célula é obrigatório" }, { status: 400 });
  }

  const newCell = await createCell({
    name,
    description,
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
