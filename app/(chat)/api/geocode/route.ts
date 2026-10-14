// GET /api/geocode?type=search&q=termo
// GET /api/geocode?type=reverse&lat=-23.55&lon=-46.63
//
// Proxy server-side para o Nominatim (OpenStreetMap). O servidor público do
// Nominatim exige um User-Agent identificando a aplicação (política de uso:
// https://operations.osmfoundation.org/policies/nominatim/) e bloqueia
// requisições que pareçam vir de autocomplete sem esse identificador —
// navegadores não permitem que JS do cliente defina o header User-Agent,
// então a chamada precisa passar pelo backend.

import { auth } from "@/app/(auth)/auth";
import { NextRequest } from "next/server";
import { z } from "zod";

const NOMINATIM_USER_AGENT = "Emetis/1.0 (contato@ecolabs.com.br)";

const searchParamsSchema = z.object({
  type: z.enum(["search", "reverse"]),
  q: z.string().trim().min(3).max(200).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
});

// Rate limit simples por usuário: evita que um cliente malicioso ou com bug
// (ex. debounce quebrado) exceda a política de 1 req/s do Nominatim.
const RATE_LIMIT_WINDOW_MS = 1_000;
const lastRequestAtByUser = new Map<string, number>();

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const now = Date.now();
  const lastRequestAt = lastRequestAtByUser.get(session.user.id) ?? 0;
  if (now - lastRequestAt < RATE_LIMIT_WINDOW_MS) {
    return Response.json({ error: "Muitas requisições, aguarde um instante" }, { status: 429 });
  }
  lastRequestAtByUser.set(session.user.id, now);

  const parsed = searchParamsSchema.safeParse({
    type: request.nextUrl.searchParams.get("type"),
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    lat: request.nextUrl.searchParams.get("lat") ?? undefined,
    lon: request.nextUrl.searchParams.get("lon") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { type, q, lat, lon } = parsed.data;

  let upstreamUrl: string;
  if (type === "search") {
    if (!q) {
      return Response.json({ error: "Parâmetro 'q' é obrigatório" }, { status: 400 });
    }
    upstreamUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&accept-language=pt-BR&countrycodes=br`;
  } else {
    if (lat === undefined || lon === undefined) {
      return Response.json({ error: "Parâmetros 'lat' e 'lon' são obrigatórios" }, { status: 400 });
    }
    upstreamUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`;
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    if (!upstreamResponse.ok) {
      console.error("Geocode upstream error:", upstreamResponse.status);
      return Response.json({ error: "Serviço de busca de endereços indisponível" }, { status: 502 });
    }

    const data = await upstreamResponse.json();
    return Response.json(data);
  } catch (error) {
    console.error("Geocode proxy error:", error);
    return Response.json({ error: "Serviço de busca de endereços indisponível" }, { status: 502 });
  }
}
