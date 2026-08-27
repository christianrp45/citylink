import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/client";
import { userBlock } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { blockedId } = body;

  if (!blockedId || typeof blockedId !== "string") {
    return Response.json({ error: "blockedId é obrigatório" }, { status: 400 });
  }

  if (blockedId === session.user.id) {
    return Response.json({ error: "Não é possível bloquear a si mesmo" }, { status: 400 });
  }

  await db
    .insert(userBlock)
    .values({ blockerId: session.user.id, blockedId })
    .onConflictDoNothing();

  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { blockedId } = body;

  if (!blockedId || typeof blockedId !== "string") {
    return Response.json({ error: "blockedId é obrigatório" }, { status: 400 });
  }

  await db
    .delete(userBlock)
    .where(
      and(
        eq(userBlock.blockerId, session.user.id),
        eq(userBlock.blockedId, blockedId)
      )
    );

  return Response.json({ success: true });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId é obrigatório" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(userBlock)
    .where(
      and(
        eq(userBlock.blockerId, session.user.id),
        eq(userBlock.blockedId, userId)
      )
    );

  return Response.json({ blocked: !!existing });
}
