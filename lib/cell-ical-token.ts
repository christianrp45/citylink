import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

// Token estático (sem expiração — assinatura de calendário fica válida
// enquanto a pessoa continuar membro aprovado da célula; ver isApprovedCellMember
// na rota /ical, que revalida isso a cada requisição). Mesmo padrão HMAC do
// reset de senha em app/(auth)/actions.ts, sem precisar de tabela nova.
export function createCellIcalToken(cellId: string, userId: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(`${cellId}|${userId}`).digest("hex").slice(0, 32);
}

export function verifyCellIcalToken(cellId: string, userId: string, token: string): boolean {
  const expected = createCellIcalToken(cellId, userId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
