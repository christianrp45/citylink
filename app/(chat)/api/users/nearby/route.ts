import { auth } from "@/app/(auth)/auth";
import { getNearbyUsers, getFriendCircles } from "@/lib/db/queries";
import { haversineMeters, fuzzyCoord } from "@/lib/geo/haversine";

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

  // Buscar círculos de confiança do usuário atual
  const circles = await getFriendCircles(session.user.id);

  const allUsers = await getNearbyUsers(session.user.id);

  const nearby = allUsers
    .filter((u) => {
      if (!u.lat || !u.lng) return false;
      if (u.availabilityStatus === "offline") return false;
      const dist = haversineMeters(
        lat, lng,
        parseFloat(u.lat), parseFloat(u.lng)
      );
      return dist <= radius;
    })
    .map((u) => {
      const circle = circles[u.id]; // 'family' | 'friends' | undefined
      const exactLat = parseFloat(u.lat!);
      const exactLng = parseFloat(u.lng!);

      // Família → localização exata. Todos os outros → bairro (~1km)
      const displayLat = circle === "family" ? exactLat : fuzzyCoord(exactLat);
      const displayLng = circle === "family" ? exactLng : fuzzyCoord(exactLng);

      return {
        ...u,
        lat: String(displayLat),
        lng: String(displayLng),
        locationPrecision: circle === "family" ? "exact" : "neighborhood",
        distance: haversineMeters(lat, lng, exactLat, exactLng),
      };
    })
    .sort((a, b) => a.distance - b.distance);

  return Response.json(nearby);
}
