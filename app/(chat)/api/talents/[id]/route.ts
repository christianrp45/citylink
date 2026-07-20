import { auth } from '@/app/(auth)/auth';
import { deleteTalent, getTalentById } from '@/lib/db/queries';

// GET /api/talents/[id] — público, para a página de compartilhamento
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const talent = await getTalentById(id);
  if (!talent || !talent.isActive) {
    return Response.json({ error: 'Talento não encontrado' }, { status: 404 });
  }
  return Response.json(talent);
}

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
