import { auth } from "@/app/(auth)/auth";
import { isApprovedCellMember } from "@/lib/db/queries";
import { createCellIcalToken } from "@/lib/cell-ical-token";

// GET /api/mdc/cells/[cellId]/ical-link — gera o link de assinatura de
// calendário pro membro logado (usado no botão "assinar calendário").
export async function GET(
  req: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { cellId } = await params;
  if (!(await isApprovedCellMember(cellId, session.user.id))) {
    return Response.json({ error: "Você não faz parte desta célula" }, { status: 403 });
  }

  const token = createCellIcalToken(cellId, session.user.id);
  const url = new URL(`/api/mdc/cells/${cellId}/ical`, req.url);
  url.searchParams.set("u", session.user.id);
  url.searchParams.set("token", token);

  return Response.json({ url: url.toString() });
}
