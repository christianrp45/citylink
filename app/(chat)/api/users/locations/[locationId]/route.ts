import { auth } from "@/app/(auth)/auth";
import {
  setActiveUserLocation,
  deactivateAllUserLocations,
  deleteUserLocation,
} from "@/lib/db/queries";

// PATCH /api/users/locations/[locationId] — ativa ou desativa um ponto
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { locationId } = await params;
  const { isActive } = await request.json();

  if (isActive) {
    const ok = await setActiveUserLocation(session.user.id, locationId);
    if (!ok) {
      return Response.json({ error: "Local não encontrado" }, { status: 404 });
    }
  } else {
    await deactivateAllUserLocations(session.user.id);
  }

  return Response.json({ success: true, isActive: Boolean(isActive) });
}

// DELETE /api/users/locations/[locationId] — remove um ponto salvo
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { locationId } = await params;
  const ok = await deleteUserLocation(session.user.id, locationId);

  if (!ok) {
    return Response.json({ error: "Local não encontrado" }, { status: 404 });
  }

  return Response.json({ success: true });
}
