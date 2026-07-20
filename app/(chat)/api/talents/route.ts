import { auth } from '@/app/(auth)/auth';
import { getTalents, createTalent, TALENT_CATEGORIES } from '@/lib/db/queries';
import { awardPoints } from '@/lib/gamification';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') ?? undefined;

  const talents = await getTalents(category);
  return Response.json(talents);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, category } = body;

  if (!title?.trim() || !category) {
    return Response.json({ error: 'Título e categoria são obrigatórios' }, { status: 400 });
  }

  if (!(TALENT_CATEGORIES as readonly string[]).includes(category)) {
    return Response.json({ error: 'Categoria inválida' }, { status: 400 });
  }

  const talent = await createTalent({
    userId: session.user.id,
    title: title.trim(),
    description: description?.trim() || undefined,
    category,
  });

  void awardPoints(session.user.id, "offer_talent");

  return Response.json(talent, { status: 201 });
}
