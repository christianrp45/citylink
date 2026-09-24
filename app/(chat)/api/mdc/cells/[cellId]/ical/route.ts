import { db } from '@/lib/db/client';
import { cell, cellMeeting } from '@/lib/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';
import { verifyCellIcalToken } from '@/lib/cell-ical-token';
import { isApprovedCellMember } from '@/lib/db/queries';

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace('.000', '');
}

function escapeICS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** GET /api/mdc/cells/[cellId]/ical?u=<userId>&token=<token>
 *  Returns an iCalendar (.ics) file with upcoming cell meetings.
 *  Sem sessão de verdade (pra funcionar direto no app de calendário), mas
 *  exige um token assinado emitido só pra um membro aprovado específico —
 *  ver /members/ical-link. Quem sair da célula perde acesso mesmo com o
 *  link antigo, porque a checagem de membership é revalidada aqui. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ cellId: string }> }
) {
  const { cellId } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('u');
  const token = searchParams.get('token');

  if (!userId || !token || !verifyCellIcalToken(cellId, userId, token)) {
    return new Response('Não autorizado', { status: 401 });
  }
  if (!(await isApprovedCellMember(cellId, userId))) {
    return new Response('Não autorizado', { status: 401 });
  }

  const [cellRow] = await db
    .select({ id: cell.id, name: cell.name, address: cell.address })
    .from(cell)
    .where(eq(cell.id, cellId));

  if (!cellRow) {
    return new Response('Not Found', { status: 404 });
  }

  // Fetch upcoming + recent meetings (last 30 days + next 90 days)
  const from = new Date();
  from.setDate(from.getDate() - 30);

  const meetings = await db
    .select({
      id: cellMeeting.id,
      scheduledAt: cellMeeting.scheduledAt,
      address: cellMeeting.address,
      status: cellMeeting.status,
      notes: cellMeeting.notes,
    })
    .from(cellMeeting)
    .where(and(eq(cellMeeting.cellId, cellId), gte(cellMeeting.scheduledAt, from)))
    .orderBy(desc(cellMeeting.scheduledAt))
    .limit(50);

  const events = meetings.map((m) => {
    const start = new Date(m.scheduledAt);
    const end = new Date(start.getTime() + 90 * 60 * 1000); // 90-minute default duration
    const location = m.address ?? cellRow.address ?? '';
    const summary = escapeICS(`Reunião — ${cellRow.name}`);
    const description = escapeICS(m.notes ?? `Reunião da célula ${cellRow.name}`);
    const uid = `${m.id}@emetis.app`;
    const statusNote = m.status === 'cancelled' ? '\nSTATUS:CANCELLED' : '';

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${escapeICS(location)}` : '',
      statusNote,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  });

  const calName = escapeICS(cellRow.name);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Emetis//Cell Calendar//PT',
    `X-WR-CALNAME:${calName}`,
    'X-WR-TIMEZONE:America/Sao_Paulo',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cellRow.name.replace(/[^a-z0-9]/gi, '-')}.ics"`,
      'Cache-Control': 'no-cache',
    },
  });
}
