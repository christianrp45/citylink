import { auth } from "@/app/(auth)/auth";
import { deleteUserAccount } from "@/lib/db/queries";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  await deleteUserAccount(session.user.id);

  return Response.json({ message: "Conta e todos os dados excluídos com sucesso" });
}
