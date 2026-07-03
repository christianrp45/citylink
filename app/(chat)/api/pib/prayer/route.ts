import { auth } from "@/app/(auth)/auth";
import {
  createPrayerRequest,
  getPrayerRequestsByCell,
} from "@/lib/db/queries-cells";

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

  const requests = await getPrayerRequestsByCell(cellId, session.user.id);
  return Response.json(requests);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId, content, isAnonymous } = await request.json();

  if (!cellId || !content) {
    return Response.json({ error: "cellId e content são obrigatórios" }, { status: 400 });
  }

  const prayerReq = await createPrayerRequest({
    cellId,
    userId: session.user.id,
    content,
    isAnonymous: isAnonymous ?? false,
  });

  return Response.json(prayerReq, { status: 201 });
}
