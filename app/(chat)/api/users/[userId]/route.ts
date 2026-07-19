import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/lib/db/queries";

// Retorna perfil público de um usuário (para página /connect/[userId])
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Retorna apenas dados públicos — sem email, senha, lat/lng ou telefone
  return Response.json({
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    profession: user.profession,
    bio: user.bio,
    availabilityStatus: user.availabilityStatus,
  });
}
