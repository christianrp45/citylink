import { auth } from "@/app/(auth)/auth";
import { getCommunityById, getCommunityMembers } from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const community = await getCommunityById(id);
  if (!community) {
    return Response.json({ error: "Comunidade não encontrada" }, { status: 404 });
  }

  const members = await getCommunityMembers(id);
  return Response.json({ ...community, members });
}
