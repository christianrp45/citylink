import { auth } from "@/app/(auth)/auth";
import { getGuideByMeeting, upsertGuide, deleteGuide, getCellById, getCellMembers, getMeetingById } from "@/lib/db/queries-cells";
import { getAllPushSubscriptionsForUsers, deletePushSubscription } from "@/lib/db/queries/push";
import { sendPush } from "@/lib/push";

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

  // Verifica se o roteiro já estava publicado antes de salvar
  const existing = await getGuideByMeeting(meetingId);
  const wasPublished = existing?.isPublished ?? false;

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

  // Envia push para todos os membros apenas na PRIMEIRA publicação
  if (isPublished && !wasPublished) {
    try {
      const meeting = await getMeetingById(meetingId);
      if (meeting) {
        const members = await getCellMembers(meeting.cellId);
        const userIds = members.map((m) => m.userId);
        if (userIds.length > 0) {
          const subscriptions = await getAllPushSubscriptionsForUsers(userIds);
          const guideTitle = sermonTitle || title;
          await Promise.all(
            subscriptions.map(async (sub) => {
              const ok = await sendPush(sub, {
                title: "📖 Novo roteiro disponível",
                body: guideTitle
                  ? `"${guideTitle}" foi publicado para a sua célula.`
                  : "O roteiro do próximo encontro foi publicado.",
                url: `/pib/cells/${meeting.cellId}/meeting/${meetingId}/guide`,
              });
              // Remove subscriptions expiradas
              if (!ok) await deletePushSubscription(sub.endpoint);
            })
          );
        }
      }
    } catch (pushErr) {
      // Falha de push não deve impedir a resposta — loga e segue
      console.error("[guide] push notification error:", pushErr);
    }
  }

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
