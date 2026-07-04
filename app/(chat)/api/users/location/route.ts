import { auth } from "@/app/(auth)/auth";
import { updateUserProfile } from "@/lib/db/queries";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.type === "guest") {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { lat, lng } = body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return Response.json(
      { error: "lat e lng devem ser números" },
      { status: 400 }
    );
  }

  await updateUserProfile(session.user.id, {
    lat: String(lat),
    lng: String(lng),
  });

  return Response.json({ ok: true });
}
