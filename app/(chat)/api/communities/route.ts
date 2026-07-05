import { auth } from "@/app/(auth)/auth";
import { createCommunity, getCommunities } from "@/lib/db/queries";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const isPublic = searchParams.has("isPublic")
    ? searchParams.get("isPublic") === "true"
    : undefined;

  const communities = await getCommunities({ type, city, isPublic });
  return Response.json(communities);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, description, address, city, state, phone, website, isPublic, requireApproval } = body;

  if (!name || !type) {
    return Response.json({ error: "name e type são obrigatórios" }, { status: 400 });
  }

  const validTypes = ["church", "company", "family", "friends", "neighborhood", "other"];
  if (!validTypes.includes(type)) {
    return Response.json({ error: "type inválido" }, { status: 400 });
  }

  try {
    const community = await createCommunity({
      name,
      type,
      description,
      address,
      city,
      state,
      phone,
      website,
      isPublic: isPublic ?? true,
      requireApproval: requireApproval ?? false,
      adminUserId: session.user.id,
    });
    return Response.json(community, { status: 201 });
  } catch {
    return Response.json({ error: "Slug já em uso ou erro ao criar comunidade" }, { status: 409 });
  }
}
