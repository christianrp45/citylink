import "server-only";

import { and, isNotNull, ne, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type User, user } from "../schema";
import { ChatbotError } from "../../errors";
import { generateUUID } from "../../utils";
import { generateHashedPassword } from "../utils";

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  phone?: string,
  profession?: string,
  accountType: "individual" | "institution" = "individual"
) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db
      .insert(user)
      .values({ email, password: hashedPassword, name, phone, profession, accountType });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to create user");
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const [result] = await db.select().from(user).where(eq(user.id, id));
    return result ?? null;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get user by id");
  }
}

export async function getNearbyUsers(excludeId: string) {
  try {
    return await db
      .select({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        profession: user.profession,
        availabilityStatus: user.availabilityStatus,
        lat: user.lat,
        lng: user.lng,
      })
      .from(user)
      .where(
        and(
          ne(user.id, excludeId),
          isNotNull(user.lat),
          isNotNull(user.lng),
        )
      );
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get nearby users"
    );
  }
}

export async function updateUserProfile(
  id: string,
  data: {
    name?: string;
    phone?: string;
    profession?: string;
    avatar?: string;
    bio?: string;
    availabilityStatus?: "mesa-posta" | "requer-aviso" | "offline";
    lat?: string;
    lng?: string;
  }
) {
  try {
    const [updated] = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();
    return updated;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update user profile"
    );
  }
}

export async function updateUserPassword(email: string, hashedPassword: string) {
  try {
    await db.update(user).set({ password: hashedPassword }).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update password");
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}
