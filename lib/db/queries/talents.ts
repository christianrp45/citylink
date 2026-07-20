import { db } from '../client';
import { userTalent, user } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const TALENT_CATEGORIES = [
  'Culinária',
  'Tecnologia',
  'Saúde',
  'Educação',
  'Construção',
  'Arte',
  'Música',
  'Idiomas',
  'Finanças',
  'Outros',
] as const;

export type TalentCategory = (typeof TALENT_CATEGORIES)[number];

export async function getTalents(category?: string) {
  const rows = await db
    .select({
      id: userTalent.id,
      title: userTalent.title,
      description: userTalent.description,
      category: userTalent.category,
      createdAt: userTalent.createdAt,
      userId: userTalent.userId,
      userName: user.name,
      userAvatar: user.avatar,
      userProfession: user.profession,
    })
    .from(userTalent)
    .innerJoin(user, eq(userTalent.userId, user.id))
    .where(eq(userTalent.isActive, true))
    .orderBy(desc(userTalent.createdAt));

  if (category) return rows.filter((r) => r.category === category);
  return rows;
}

export async function getMyTalents(userId: string) {
  return db
    .select()
    .from(userTalent)
    .where(eq(userTalent.userId, userId))
    .orderBy(desc(userTalent.createdAt));
}

export async function createTalent(data: {
  userId: string;
  title: string;
  description?: string;
  category: string;
}) {
  const [row] = await db.insert(userTalent).values(data).returning();
  return row;
}

export async function deleteTalent(id: string, userId: string) {
  const [row] = await db
    .delete(userTalent)
    .where(eq(userTalent.id, id))
    .returning();
  if (!row || row.userId !== userId) return null;
  return row;
}
