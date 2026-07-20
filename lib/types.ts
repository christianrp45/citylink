import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/lib/artifacts/types";
import type { createDocument } from "./ai/tools/create-document";
import type { getWeather } from "./ai/tools/get-weather";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};

// ============ Emetis 2.0 - Community Mutual Aid Types ============

export type LatLng = {
  lat: number;
  lng: number;
};

export type AvailabilityStatus = "mesa-posta" | "requer-aviso" | "offline";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profession?: string;
  avatar?: string;
  bio?: string;
  helpOffer?: string; // "Como posso ajudar" - talentos da pessoa
  availabilityStatus: AvailabilityStatus; // "Mesa Posta" (green) | "Requer Aviso" (yellow) | "Offline"
  location?: LatLng; // Localização atual
  homeLocation?: LatLng; // Localização da casa
  isOnline: boolean;
  friends: string[]; // Array de user IDs
  churchId?: string;
  createdAt: string;
};

export type SamaritanAlert = {
  id: string;
  userId: string;
  userName: string;
  type: "urgency" | "prayer" | "practical_help"; // Tipo de ajuda
  description: string;
  location: LatLng;
  createdAt: string;
  status: "active" | "resolved";
  responses?: string[]; // Array de user IDs que responderam
};

export type Business = {
  id: string;
  name: string;
  category: "alimentacao" | "saude" | "mercado" | "educacao" | "servicos" | "religioso";
  phone?: string;
  address?: string;
  location?: LatLng;
  rating?: number;
  description?: string;
  communityRecommendations: string[]; // Array de user IDs que recomendam
  loyaltyPoints?: number;
  createdAt: string;
};

export type CommunityEvent = {
  id: string;
  title: string;
  type: "social" | "religious" | "volunteer" | "business";
  date: string;
  location?: LatLng;
  description?: string;
  organizerId: string;
  participants: string[]; // Array de user IDs
  createdAt: string;
};

// ============================================================
// EMETIS — MÓDULO CÉLULAS
// ============================================================

export type CellTargetAudience =
  | "jovens"
  | "casais"
  | "adultos"
  | "terceira-idade"
  | "misto";

export type CellMemberRole = "leader" | "co-leader" | "member" | "visitor";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export type RsvpStatus = "going" | "not-going" | "maybe" | "no-response";

export type YoutubeLink = {
  title: string;
  url: string;
};

export type CellSummary = {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  neighborhood?: string;
  address?: string;
  meetingDay?: number;   // 0=Dom 1=Seg ... 6=Sab
  meetingTime?: string;  // "19:30"
  targetAudience: CellTargetAudience;
  maxMembers: number;
  memberCount: number;   // calculado
  isOpen: boolean;
  entryMode: "open" | "invite_only";
  createdAt: string;
};

export type CellMemberDetail = {
  cellId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: CellMemberRole;
  isActive: boolean;
  joinedAt: string;
};

export type CellMeetingWithGuide = {
  id: string;
  cellId: string;
  scheduledAt: string;
  address?: string;
  status: MeetingStatus;
  visitorCount: number;
  notes?: string;
  guide?: CellGuideDetail;
  myRsvp?: RsvpStatus;
  createdAt: string;
};

export type StudyPoint = {
  title: string;
  bibleRef: string;
  content: string;
  discussionQuestion: string;
  innerReflection?: string;
};

export type CellGuideDetail = {
  id: string;
  meetingId: string;
  title: string;
  biblePassage?: string;
  sermonTitle?: string;
  preacher?: string;
  theme?: string;
  // PARA O LÍDER
  leaderNote?: string;
  // QUEBRANDO O GELO
  icebreakerTitle?: string;
  icebreaker?: string;
  // EXALTAÇÃO
  youtubeLinks?: YoutubeLink[];
  // O QUE APRENDEMOS ESSA SEMANA?
  introduction?: string;
  studyPoints?: StudyPoint[];
  // CONCLUSÃO E CHECAGEM
  conclusion?: string;
  // EVANGELISMO
  evangelism?: string;
  evangelismStory?: string;
  evangelismChallenge?: string;
  // legado
  studyQuestions?: string[];
  application?: string;
  prayer?: string;
  isPublished: boolean;
  publishedAt?: string;
  generatedByAI: boolean;
  // Anotações privadas do líder
  leaderNotes?: string;
  createdAt: string;
};

export type PrayerRequestDetail = {
  id: string;
  cellId: string;
  userId: string;
  authorName: string;          // vazio se anônimo
  content: string;
  isAnonymous: boolean;
  isAnswered: boolean;
  prayerCount: number;         // total de interações
  userHasPrayed: boolean;      // se o usuário logado já reagiu
  userReaction: string | null; // emoji escolhido pelo usuário logado
  reactions: { emoji: string; count: number }[]; // contagem por emoji
  createdAt: string;
};
