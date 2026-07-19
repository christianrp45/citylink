import { auth } from "@/app/(auth)/auth";
import { getGuideByMeeting, upsertGuide, deleteGuide, getCellById } from "@/lib/db/queries-cells";
import { getMeetingById } from "@/lib/db/queries-cells";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const guide = await getGuideByMeeting(meetingId);

  if (!guide) {
    return Response.json({ error: "Roteiro não encontrado" }, { status: 404 });
  }

  return Response.json(guide);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const body = await request.json();

  const {
    title,
    biblePassage,
    sermonTitle,
    preacher,
    theme,
    leaderNote,
    icebreakerTitle,
    icebreaker,
    youtubeLinks,
    introduction,
    studyPoints,
    conclusion,
    evangelism,
    evangelismStory,
    evangelismChallenge,
    studyQuestions,
    application,
    prayer,
    isPublished,
    generatedByAI,
    leaderNotes,
  } = body;

  if (!title) {
    return Response.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  const guide = await upsertGuide({
    meetingId,
    title,
    biblePassage,
    sermonTitle,
    preacher,
    theme,
    leaderNote,
    icebreakerTitle,
    icebreaker,
    youtubeLinks,
    introduction,
    studyPoints,
    conclusion,
    evangelism,
    evangelismStory,
    evangelismChallenge,
    studyQuestions,
    application,
    prayer,
    isPublished: isPublished ?? false,
    generatedByAI: generatedByAI ?? false,
    leaderNotes,
  });

  return Response.json(guide, { status: 201 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { meetingId } = await params;
  const meeting = await getMeetingById(meetingId);
  if (!meeting) {
    return Response.json({ error: "Encontro não encontrado" }, { status: 404 });
  }

  const cell = await getCellById(meeting.cellId);
  if (
    !cell ||
    (cell.leaderId !== session.user.id && cell.coLeaderId !== session.user.id)
  ) {
    return Response.json({ error: "Apenas o líder pode excluir roteiros" }, { status: 403 });
  }

  await deleteGuide(meetingId);
  return Response.json({ ok: true });
}
