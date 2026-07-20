import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { cellMessage, user } from "../schema";

export async function getCellMessages(cellId: string, limit = 100) {
  return db
    .select({
      id: cellMessage.id,
      cellId: cellMessage.cellId,
      fromUserId: cellMessage.fromUserId,
      authorName: user.name,
      authorAvatar: user.avatar,
      content: cellMessage.content,
      createdAt: cellMessage.createdAt,
    })
    .from(cellMessage)
    .leftJoin(user, eq(cellMessage.fromUserId, user.id))
    .where(eq(cellMessage.cellId, cellId))
    .orderBy(asc(cellMessage.createdAt))
    .limit(limit);
}

export async function createCellMessage(data: {
  cellId: string;
  fromUserId: string;
  content: string;
}) {
  const [created] = await db.insert(cellMessage).values(data).returning();
  return created;
}
