import { auth } from "@/app/(auth)/auth";
import { getGuideByMeeting, upsertGuide } from "@/lib/db/queries-cells";

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
  });

  return Response.json(guide, { status: 201 });
}
