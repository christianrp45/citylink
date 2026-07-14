import "server-only";

import { eq, inArray, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  alertResponse,
  bibleHighlight,
  cellAttendance,
  cellMember,
  chat,
  communityMember,
  consentLog,
  directMessage,
  document,
  eventAttendee,
  friendship,
  hospitalityWindow,
  message,
  messageDeprecated,
  prayerGroupMember,
  prayerInteraction,
  prayerRequest,
  proximityAlert,
  pushSubscription,
  readingPlanProgress,
  samaritanAlert,
  stream,
  suggestion,
  testimonial,
  testimonialComment,
  testimonialLike,
  user,
  userPrivacySettings,
  userProximityConfig,
  userVisibilityConfig,
  visitRequest,
  volunteerEnrollment,
  vote,
  voteDeprecated,
} from "../schema";

// ============================================================
// ETAPA 9 — LGPD: EXCLUSÃO DE CONTA (art. 18)
// Remove todos os dados do usuário em ordem de dependência FK
// ============================================================

export async function deleteUserAccount(userId: string) {
  // 1. Dados LGPD e configurações (sem dependências)
  await db.delete(consentLog).where(eq(consentLog.userId, userId));
  await db.delete(proximityAlert).where(
    or(eq(proximityAlert.userId, userId), eq(proximityAlert.nearUserId, userId))
  );
  await db.delete(userProximityConfig).where(eq(userProximityConfig.userId, userId));
  await db.delete(userVisibilityConfig).where(eq(userVisibilityConfig.userId, userId));
  await db.delete(userPrivacySettings).where(eq(userPrivacySettings.userId, userId));

  // 2. Comunidade
  await db.delete(communityMember).where(eq(communityMember.userId, userId));

  // 3. Voluntariado
  await db.delete(volunteerEnrollment).where(eq(volunteerEnrollment.userId, userId));

  // 4. Testemunhos
  await db.delete(testimonialLike).where(eq(testimonialLike.userId, userId));
  await db.delete(testimonialComment).where(eq(testimonialComment.userId, userId));
  await db.delete(testimonial).where(eq(testimonial.userId, userId));

  // 5. Oração (interações antes dos pedidos)
  await db.delete(prayerInteraction).where(eq(prayerInteraction.userId, userId));
  await db.delete(prayerRequest).where(eq(prayerRequest.userId, userId));
  await db.delete(prayerGroupMember).where(eq(prayerGroupMember.userId, userId));

  // 6. Células (attendance antes de member)
  await db.delete(cellAttendance).where(eq(cellAttendance.userId, userId));
  await db.delete(cellMember).where(eq(cellMember.userId, userId));

  // 7. Alertas e eventos
  await db.delete(alertResponse).where(eq(alertResponse.userId, userId));
  await db.delete(samaritanAlert).where(eq(samaritanAlert.userId, userId));
  await db.delete(eventAttendee).where(eq(eventAttendee.userId, userId));

  // 8. Mensagens diretas, visitas e hospitalidade
  await db.delete(directMessage).where(
    or(eq(directMessage.fromUserId, userId), eq(directMessage.toUserId, userId))
  );
  await db.delete(visitRequest).where(
    or(eq(visitRequest.fromUserId, userId), eq(visitRequest.toUserId, userId))
  );
  await db.delete(hospitalityWindow).where(eq(hospitalityWindow.userId, userId));

  // 9. Amizades e push
  await db.delete(friendship).where(
    or(eq(friendship.userId, userId), eq(friendship.friendId, userId))
  );
  await db.delete(pushSubscription).where(eq(pushSubscription.userId, userId));

  // 10. Bíblia e plano de leitura
  await db.delete(bibleHighlight).where(eq(bibleHighlight.userId, userId));
  await db.delete(readingPlanProgress).where(eq(readingPlanProgress.userId, userId));

  // 11. Chats (votes e messages primeiro — ambas as gerações de schema)
  const userChats = await db
    .select({ id: chat.id })
    .from(chat)
    .where(eq(chat.userId, userId));
  if (userChats.length > 0) {
    const chatIds = userChats.map((c) => c.id);
    // Vote_v2 e Message_v2 (schema atual)
    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    // Vote e Message (schema legado — deve existir antes de deletar Chat)
    await db.delete(voteDeprecated).where(inArray(voteDeprecated.chatId, chatIds));
    await db.delete(messageDeprecated).where(inArray(messageDeprecated.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));
    // Suggestions referenciam documents, não chats
  }
  await db.delete(chat).where(eq(chat.userId, userId));

  // 12. Documents e suggestions
  const userDocs = await db
    .select({ id: document.id })
    .from(document)
    .where(eq(document.userId, userId));
  if (userDocs.length > 0) {
    const docIds = userDocs.map((d) => d.id);
    await db.delete(suggestion).where(inArray(suggestion.documentId, docIds));
  }
  await db.delete(document).where(eq(document.userId, userId));

  // 13. Por fim, o próprio usuário
  // (inviteCode, userLocation, businessRecommendation têm ON DELETE CASCADE)
  await db.delete(user).where(eq(user.id, userId));
}
