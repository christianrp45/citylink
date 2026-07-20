import { auth } from "@/app/(auth)/auth";
import { countUnreadMessages } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ count: 0 });
  }
  const count = await countUnreadMessages(session.user.id);
  return Response.json({ count });
}
