import { auth } from "@/app/(auth)/auth";
import { createMeeting, getMeetingsByCell } from "@/lib/db/queries-cells";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cellId = searchParams.get("cellId");

  if (!cellId) {
    return Response.json({ error: "cellId é obrigatório" }, { status: 400 });
  }

  const meetings = await getMeetingsByCell(cellId);
  return Response.json(meetings);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { cellId, scheduledAt, address } = body;

  if (!cellId || !scheduledAt) {
    return Response.json({ error: "cellId e scheduledAt são obrigatórios" }, { status: 400 });
  }

  const meeting = await createMeeting({
    cellId,
    scheduledAt: new Date(scheduledAt),
    address,
  });

  return Response.json(meeting, { status: 201 });
}
