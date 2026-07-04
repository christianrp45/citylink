import { auth } from "@/app/(auth)/auth";
import { respondVisitRequest } from "@/lib/db/queries";

// POST /api/visits/respond — aceitar ou recusar visita
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { requestId, status } = await request.json();

  if (!requestId || typeof requestId !== "string") {
    return Response.json({ error: "requestId inválido" }, { status: 400 });
  }

  if (status !== "accepted" && status !== "declined") {
    return Response.json(
      { error: "status deve ser 'accepted' ou 'declined'" },
      { status: 400 }
    );
  }

  const updated = await respondVisitRequest(
    requestId,
    session.user.id,
    status
  );

  if (!updated) {
    return Response.json(
      { error: "Solicitação não encontrada ou sem permissão" },
      { status: 404 }
    );
  }

  return Response.json(updated);
}
