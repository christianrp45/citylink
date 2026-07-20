import { auth } from '@/app/(auth)/auth';
import { deleteTalent } from '@/lib/db/queries';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteTalent(id, session.user.id);

  if (!deleted) {
    return Response.json({ error: 'Talento não encontrado ou sem permissão' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
