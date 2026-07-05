import { auth } from "@/app/(auth)/auth";
import {
  getUserLocations,
  addUserLocation,
} from "@/lib/db/queries";

// GET /api/users/locations — lista os pontos salvos do usuário
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const locations = await getUserLocations(session.user.id);
  return Response.json(locations);
}

// POST /api/users/locations — salva um novo ponto de localização
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { label, type, lat, lng, setActive } = body;

  if (!label || !lat || !lng) {
    return Response.json(
      { error: "label, lat e lng são obrigatórios" },
      { status: 400 }
    );
  }

  const validTypes = ["home", "work", "church", "other"];
  const locType = validTypes.includes(type) ? type : "other";

  const created = await addUserLocation(session.user.id, {
    label: String(label).slice(0, 50),
    type: locType as "home" | "work" | "church" | "other",
    lat: String(lat),
    lng: String(lng),
    setActive: Boolean(setActive),
  });

  return Response.json(created, { status: 201 });
}
