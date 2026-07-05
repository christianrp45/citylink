// GET /api/hospitality/active — todas as janelas de hospitalidade ativas agora
import { auth } from "@/app/(auth)/auth";
import { getActiveHospitalityWindows } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const windows = await getActiveHospitalityWindows();
  return Response.json(windows);
}
