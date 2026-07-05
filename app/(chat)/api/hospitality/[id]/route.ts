// DELETE /api/hospitality/[id] — cancelar janela de hospitalidade
import { auth } from "@/app/(auth)/auth";
import { deleteHospitalityWindow } from "@/lib/db/queries";
import { NextRequest } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteHospitalityWindow(id, session.user.id);
  return Response.json({ ok: true });
}
