import { auth } from "@/app/(auth)/auth";
import { getNearbyUsers } from "@/lib/db/queries";

function haversine(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("radius") ?? "2000");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json(
      { error: "Parâmetros lat e lng são obrigatórios" },
      { status: 400 }
    );
  }

  const allUsers = await getNearbyUsers(session.user.id);

  const nearby = allUsers
    .filter((u) => {
      if (!u.lat || !u.lng) return false;
      // Não mostrar usuários offline
      if (u.availabilityStatus === "offline") return false;
      const dist = haversine(
        { lat, lng },
        { lat: parseFloat(u.lat), lng: parseFloat(u.lng) }
      );
      return dist <= radius;
    })
    .map((u) => ({
      ...u,
      distance: haversine(
        { lat, lng },
        { lat: parseFloat(u.lat!), lng: parseFloat(u.lng!) }
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  return Response.json(nearby);
}
