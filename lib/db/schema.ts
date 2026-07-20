import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  date,
  foreignKey,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
  name: varchar("name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  profession: varchar("profession", { length: 100 }),
  avatar: text("avatar"),
  bio: text("bio"),
  availabilityStatus: varchar("availabilityStatus", {
    enum: ["mesa-posta", "requer-aviso", "offline"],
  }).default("mesa-posta"),
  accountType: varchar("accountType", {
    enum: ["individual", "institution"],
  }).notNull().default("individual"),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  primaryChurchId: uuid("primaryChurchId"),
  birthDate: date("birthDate"),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chatbot.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chatbot.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

// ============================================================
// EMETIS — AMIZADES E VISITAS
// ============================================================

export const friendship = pgTable(
  "Friendship",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    friendId: uuid("friendId")
      .notNull()
      .references(() => user.id),
    status: varchar("status", {
      enum: ["pending", "accepted"],
    })
      .notNull()
      .default("pending"),
    // Círculo de Confiança: 'family' vê localização exata, 'friends' vê apenas bairro
    circle: varchar("circle", {
      enum: ["family", "friends"],
    })
      .notNull()
      .default("friends"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.friendId] }),
  })
);

export type Friendship = InferSelectModel<typeof friendship>;

// ============================================================
// EMETIS — EVENTOS
// ============================================================

export const event = pgTable("Event", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", {
    enum: ["social", "religious", "volunteer", "business"],
  })
    .notNull()
    .default("social"),
  address: text("address"),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  date: timestamp("date").notNull(),
  organizerId: uuid("organizerId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Event = InferSelectModel<typeof event>;

export const eventAttendee = pgTable(
  "EventAttendee",
  {
    eventId: uuid("eventId")
      .notNull()
      .references(() => event.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.eventId, table.userId] }),
  })
);

export type EventAttendee = InferSelectModel<typeof eventAttendee>;

// ============================================================
// EMETIS — ALERTAS SAMARITANOS
// ============================================================

export const samaritanAlert = pgTable("SamaritanAlert", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  type: varchar("type", {
    enum: ["urgency", "prayer", "practical_help"],
  })
    .notNull()
    .default("practical_help"),
  description: text("description").notNull(),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  status: varchar("status", {
    enum: ["open", "resolved"],
  })
    .notNull()
    .default("open"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type SamaritanAlert = InferSelectModel<typeof samaritanAlert>;

export const alertResponse = pgTable(
  "AlertResponse",
  {
    alertId: uuid("alertId")
      .notNull()
      .references(() => samaritanAlert.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    message: text("message"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.alertId, table.userId] }),
  })
);

export type AlertResponse = InferSelectModel<typeof alertResponse>;

export const directMessage = pgTable("DirectMessage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  fromUserId: uuid("fromUserId")
    .notNull()
    .references(() => user.id),
  toUserId: uuid("toUserId")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  readAt: timestamp("readAt"),
});

export type DirectMessage = InferSelectModel<typeof directMessage>;

export const visitRequest = pgTable("VisitRequest", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  fromUserId: uuid("fromUserId")
    .notNull()
    .references(() => user.id),
  toUserId: uuid("toUserId")
    .notNull()
    .references(() => user.id),
  message: text("message"),
  status: varchar("status", {
    enum: ["pending", "accepted", "declined", "postponed"],
  })
    .notNull()
    .default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  respondedAt: timestamp("respondedAt"),
});

export type VisitRequest = InferSelectModel<typeof visitRequest>;

// ============================================================
// EMETIS — MÓDULO CÉLULAS
// ============================================================

export const cell = pgTable("Cell", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  // Associação opcional a uma comunidade — null = célula independente
  communityId: uuid("communityId").references(() => community.id),
  leaderId: uuid("leaderId")
    .notNull()
    .references(() => user.id),
  coLeaderId: uuid("coLeaderId").references(() => user.id),
  neighborhood: varchar("neighborhood", { length: 100 }),
  address: text("address"),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  meetingDay: integer("meetingDay"),       // 0=Dom 1=Seg ... 6=Sab
  meetingTime: varchar("meetingTime", { length: 5 }), // "19:30"
  targetAudience: varchar("targetAudience", {
    enum: ["jovens", "casais", "adultos", "terceira-idade", "misto"],
  })
    .notNull()
    .default("misto"),
  maxMembers: integer("maxMembers").default(15),
  isOpen: boolean("isOpen").notNull().default(true),
  // 'open' = qualquer pessoa entra diretamente
  // 'invite_only' = somente via código de convite (padrão)
  entryMode: varchar("entryMode", { enum: ["open", "invite_only"] })
    .notNull()
    .default("invite_only"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Cell = InferSelectModel<typeof cell>;

export const cellMember = pgTable(
  "CellMember",
  {
    cellId: uuid("cellId")
      .notNull()
      .references(() => cell.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    role: varchar("role", {
      enum: ["leader", "co-leader", "member", "visitor"],
    })
      .notNull()
      .default("member"),
    isActive: boolean("isActive").notNull().default(true),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.cellId, table.userId] }),
  })
);

export type CellMember = InferSelectModel<typeof cellMember>;

export const cellMeeting = pgTable("CellMeeting", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  cellId: uuid("cellId")
    .notNull()
    .references(() => cell.id),
  scheduledAt: timestamp("scheduledAt").notNull(),
  address: text("address"),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  status: varchar("status", {
    enum: ["scheduled", "completed", "cancelled"],
  })
    .notNull()
    .default("scheduled"),
  visitorCount: integer("visitorCount").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type CellMeeting = InferSelectModel<typeof cellMeeting>;

export type StudyPoint = {
  title: string;
  bibleRef: string;
  content: string;
  discussionQuestion: string;
};

export const cellGuide = pgTable("CellGuide", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  meetingId: uuid("meetingId")
    .notNull()
    .references(() => cellMeeting.id),
  title: text("title").notNull(),
  biblePassage: varchar("biblePassage", { length: 100 }),
  sermonTitle: text("sermonTitle"),
  preacher: text("preacher"),
  theme: text("theme"),
  // PARA O LÍDER
  leaderNote: text("leaderNote"),
  // QUEBRANDO O GELO
  icebreakerTitle: text("icebreakerTitle"),
  icebreaker: text("icebreaker"),
  // EXALTAÇÃO
  youtubeLinks: json("youtubeLinks").$type<{ title: string; url: string }[]>(),
  // O QUE APRENDEMOS ESSA SEMANA?
  introduction: text("introduction"),
  studyPoints: json("studyPoints").$type<StudyPoint[]>(),
  // CONCLUSÃO E CHECAGEM
  conclusion: text("conclusion"),
  // EVANGELISMO
  evangelism: text("evangelism"),
  evangelismStory: text("evangelismStory"),
  evangelismChallenge: text("evangelismChallenge"),
  // legado (backward compat)
  studyQuestions: json("studyQuestions").$type<string[]>(),
  application: text("application"),
  prayer: text("prayer"),
  isPublished: boolean("isPublished").notNull().default(false),
  publishedAt: timestamp("publishedAt"),
  generatedByAI: boolean("generatedByAI").notNull().default(false),
  // Anotações privadas do líder — visíveis apenas ao líder e co-líder
  leaderNotes: text("leaderNotes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type CellGuide = InferSelectModel<typeof cellGuide>;

export const cellAttendance = pgTable(
  "CellAttendance",
  {
    meetingId: uuid("meetingId")
      .notNull()
      .references(() => cellMeeting.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    rsvpStatus: varchar("rsvpStatus", {
      enum: ["going", "not-going", "maybe", "no-response"],
    })
      .notNull()
      .default("no-response"),
    attended: boolean("attended"),
    respondedAt: timestamp("respondedAt"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.meetingId, table.userId] }),
  })
);

export type CellAttendance = InferSelectModel<typeof cellAttendance>;

export const cellMessage = pgTable("CellMessage", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  cellId: uuid("cellId")
    .notNull()
    .references(() => cell.id, { onDelete: "cascade" }),
  fromUserId: uuid("fromUserId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type CellMessage = InferSelectModel<typeof cellMessage>;

export const prayerRequest = pgTable("PrayerRequest", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  cellId: uuid("cellId")
    .notNull()
    .references(() => cell.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  isAnswered: boolean("isAnswered").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type PrayerRequest = InferSelectModel<typeof prayerRequest>;

export const prayerInteraction = pgTable(
  "PrayerInteraction",
  {
    prayerRequestId: uuid("prayerRequestId")
      .notNull()
      .references(() => prayerRequest.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    emoji: varchar("emoji", { length: 10 }).notNull().default("🙏"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.prayerRequestId, table.userId] }),
  })
);

export type PrayerInteraction = InferSelectModel<typeof prayerInteraction>;

// ============================================================
// EMETIS — FASE 6: PUSH NOTIFICATIONS
// ============================================================

export const pushSubscription = pgTable(
  "PushSubscription",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  }
);

export type PushSubscription = InferSelectModel<typeof pushSubscription>;

// ============================================================
// EMETIS — FASE 7: IGREJAS, TESTEMUNHOS, ORAÇÃO, VOLUNTARIADO
// ============================================================

export const church = pgTable("Church", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  denomination: varchar("denomination", { length: 100 }),
  description: text("description"),
  address: text("address"),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  phone: varchar("phone", { length: 30 }),
  schedule: text("schedule"),
  pastor: varchar("pastor", { length: 100 }),
  members: integer("members").default(0),
  adminUserId: uuid("adminUserId").references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Church = InferSelectModel<typeof church>;

export const testimonial = pgTable("Testimonial", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Testimonial = InferSelectModel<typeof testimonial>;

export const testimonialLike = pgTable(
  "TestimonialLike",
  {
    testimonialId: uuid("testimonialId")
      .notNull()
      .references(() => testimonial.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    emoji: varchar("emoji", { length: 10 }).notNull().default("❤️"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.testimonialId, table.userId] }),
  })
);

export type TestimonialLike = InferSelectModel<typeof testimonialLike>;

export const testimonialComment = pgTable("TestimonialComment", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  testimonialId: uuid("testimonialId")
    .notNull()
    .references(() => testimonial.id),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type TestimonialComment = InferSelectModel<typeof testimonialComment>;

export const prayerGroup = pgTable("PrayerGroup", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  schedule: varchar("schedule", { length: 100 }),
  topic: varchar("topic", { length: 100 }),
  isOnline: boolean("isOnline").notNull().default(false),
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type PrayerGroup = InferSelectModel<typeof prayerGroup>;

export const prayerGroupMember = pgTable(
  "PrayerGroupMember",
  {
    groupId: uuid("groupId")
      .notNull()
      .references(() => prayerGroup.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.userId] }),
  })
);

export type PrayerGroupMember = InferSelectModel<typeof prayerGroupMember>;

export const volunteerOpportunity = pgTable("VolunteerOpportunity", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  address: text("address"),
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
  date: timestamp("date").notNull(),
  spots: integer("spots").notNull().default(10),
  organizerName: varchar("organizerName", { length: 100 }),
  creatorId: uuid("creatorId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type VolunteerOpportunity = InferSelectModel<typeof volunteerOpportunity>;

export const volunteerEnrollment = pgTable(
  "VolunteerEnrollment",
  {
    opportunityId: uuid("opportunityId")
      .notNull()
      .references(() => volunteerOpportunity.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    enrolledAt: timestamp("enrolledAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.opportunityId, table.userId] }),
  })
);

export type VolunteerEnrollment = InferSelectModel<typeof volunteerEnrollment>;

// ============================================================
// EMETIS — ETAPA 8: COMUNIDADES, PRIVACIDADE E LGPD
// ============================================================

export const community = pgTable("Community", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 100 }).unique(),
  type: varchar("type", {
    enum: ["church", "company", "family", "friends", "neighborhood", "other"],
  }).notNull().default("other"),
  description: text("description"),
  avatar: text("avatar"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 50 }).default("BR"),
  phone: varchar("phone", { length: 30 }),
  website: text("website"),
  isPublic: boolean("isPublic").notNull().default(true),
  requireApproval: boolean("requireApproval").notNull().default(false),
  adminUserId: uuid("adminUserId")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type Community = InferSelectModel<typeof community>;

export const communityMember = pgTable(
  "CommunityMember",
  {
    communityId: uuid("communityId")
      .notNull()
      .references(() => community.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    role: varchar("role", {
      enum: ["owner", "admin", "moderator", "member"],
    }).notNull().default("member"),
    joinedAt: timestamp("joinedAt").notNull().defaultNow(),
    approvedAt: timestamp("approvedAt"),
    canPost: boolean("canPost").notNull().default(true),
    canInvite: boolean("canInvite").notNull().default(false),
    canManageEvents: boolean("canManageEvents").notNull().default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.communityId, table.userId] }),
  })
);

export type CommunityMember = InferSelectModel<typeof communityMember>;

// ── Privacidade e LGPD ────────────────────────────────────────

export const userPrivacySettings = pgTable("UserPrivacySettings", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id),
  // Consentimentos obrigatórios e opcionais (LGPD art. 7 e 8)
  consentDataProcessing: boolean("consentDataProcessing").notNull().default(false),
  consentDataProcessingAt: timestamp("consentDataProcessingAt"),
  consentLocation: boolean("consentLocation").notNull().default(false),
  consentLocationAt: timestamp("consentLocationAt"),
  consentProximityAlerts: boolean("consentProximityAlerts").notNull().default(false),
  consentProximityAlertsAt: timestamp("consentProximityAlertsAt"),
  consentVisitRequests: boolean("consentVisitRequests").notNull().default(false),
  consentVisitRequestsAt: timestamp("consentVisitRequestsAt"),
  consentProfileVisible: boolean("consentProfileVisible").notNull().default(false),
  consentProfileVisibleAt: timestamp("consentProfileVisibleAt"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserPrivacySettings = InferSelectModel<typeof userPrivacySettings>;

export const userVisibilityConfig = pgTable("UserVisibilityConfig", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id),
  // Quem pode ver minha localização no mapa
  locationVisibleTo: varchar("locationVisibleTo", {
    enum: ["nobody", "friends", "my_community", "all"],
  }).notNull().default("friends"),
  // Quem pode me enviar pedido de visita
  visitRequestFrom: varchar("visitRequestFrom", {
    enum: ["nobody", "friends", "my_community", "all"],
  }).notNull().default("friends"),
  // Quem pode me enviar mensagem
  chatFrom: varchar("chatFrom", {
    enum: ["nobody", "friends", "my_community", "all"],
  }).notNull().default("friends"),
  // Quem vê meu perfil completo
  profileVisibleTo: varchar("profileVisibleTo", {
    enum: ["nobody", "friends", "my_community", "all"],
  }).notNull().default("my_community"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserVisibilityConfig = InferSelectModel<typeof userVisibilityConfig>;

export const userProximityConfig = pgTable("UserProximityConfig", {
  userId: uuid("userId")
    .primaryKey()
    .notNull()
    .references(() => user.id),
  isActive: boolean("isActive").notNull().default(false),
  // Raio em metros para detecção de proximidade
  radiusMeters: integer("radiusMeters").notNull().default(500),
  // Contexto geográfico em que os alertas ficam ativos
  activeWhen: varchar("activeWhen", {
    enum: ["same_city", "same_state", "same_country", "always", "never"],
  }).notNull().default("same_city"),
  // LGPD: localização expira automaticamente após N horas
  locationExpiresHours: integer("locationExpiresHours").notNull().default(6),
  lastLocationAt: timestamp("lastLocationAt"),
  // Quem me notifica quando estou perto
  notifyWhenFriendNear: boolean("notifyWhenFriendNear").notNull().default(true),
  notifyWhenCellMemberNear: boolean("notifyWhenCellMemberNear").notNull().default(true),
  notifyWhenCommunityNear: boolean("notifyWhenCommunityNear").notNull().default(false),
  // Cooldown: evita spam entre o mesmo par de usuários
  cooldownMinutes: integer("cooldownMinutes").notNull().default(60),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserProximityConfig = InferSelectModel<typeof userProximityConfig>;

export const proximityAlert = pgTable("ProximityAlert", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  nearUserId: uuid("nearUserId")
    .notNull()
    .references(() => user.id),
  distanceMeters: integer("distanceMeters").notNull(),
  relationContext: varchar("relationContext", {
    enum: ["friend", "cell_member", "community_member"],
  }).notNull(),
  sentAt: timestamp("sentAt").notNull().defaultNow(),
  // LGPD: TTL automático — dado excluído após expiração
  expiresAt: timestamp("expiresAt").notNull(),
});

export type ProximityAlert = InferSelectModel<typeof proximityAlert>;

// ConsentLog — tabela de auditoria LGPD (INSERT ONLY, nunca atualizar)
export const consentLog = pgTable("ConsentLog", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  module: varchar("module", {
    enum: ["data_processing", "location", "proximity", "visit_requests", "profile", "chat"],
  }).notNull(),
  action: varchar("action", {
    enum: ["granted", "revoked"],
  }).notNull(),
  // Anonimizado conforme LGPD: apenas primeiros 3 octetos do IP
  ipAddress: varchar("ipAddress", { length: 20 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type ConsentLog = InferSelectModel<typeof consentLog>;

// BibleHighlight — destaques e notas pessoais em versículos
export const bibleHighlight = pgTable("BibleHighlight", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  book: varchar("book", { length: 10 }).notNull(),   // abbrev: "jo", "rm", "sl"
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  color: varchar("color", {
    enum: ["yellow", "green", "pink", "blue"],
  })
    .notNull()
    .default("yellow"),
  note: text("note"),
  version: varchar("version", { length: 10 }).notNull().default("nvi"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type BibleHighlight = InferSelectModel<typeof bibleHighlight>;

// HospitalityWindow — "Mesa Posta" com hora marcada (Janelas de Hospitalidade)
export const hospitalityWindow = pgTable("HospitalityWindow", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  startsAt: timestamp("startsAt").notNull(),
  endsAt: timestamp("endsAt").notNull(),
  radiusMeters: integer("radiusMeters").notNull().default(5000),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type HospitalityWindow = InferSelectModel<typeof hospitalityWindow>;

// ReadingPlanProgress — progresso do usuário em planos de leitura bíblica
export const readingPlanProgress = pgTable("ReadingPlanProgress", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  planSlug: varchar("planSlug", { length: 100 }).notNull(),
  completedDays: json("completedDays").notNull().$type<number[]>().default([]),
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  lastReadAt: timestamp("lastReadAt"),
});

export type ReadingPlanProgress = InferSelectModel<typeof readingPlanProgress>;

// ============================================================
// EMETIS — SISTEMA DE VÍNCULOS: CONVITES
// ============================================================

export const inviteCode = pgTable("InviteCode", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  // 'church' | 'cell' | 'community'
  type: varchar("type", {
    enum: ["church", "cell", "community"],
  }).notNull(),
  targetId: uuid("targetId").notNull(),
  createdBy: uuid("createdBy")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // role que o convidado receberá ao entrar
  role: varchar("role", {
    enum: ["member", "leader", "co-leader", "visitor", "admin", "moderator"],
  }).notNull().default("member"),
  maxUses: integer("maxUses"),          // null = ilimitado
  usedCount: integer("usedCount").notNull().default(0),
  expiresAt: timestamp("expiresAt"),    // null = não expira
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type InviteCode = InferSelectModel<typeof inviteCode>;

// ─── UserLocation ──────────────────────────────────────────────────────────────
export const userLocation = pgTable("UserLocation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).notNull(),
  type: varchar("type", {
    enum: ["home", "work", "church", "other"],
  }).notNull().default("other"),
  lat: varchar("lat", { length: 20 }).notNull(),
  lng: varchar("lng", { length: 20 }).notNull(),
  isActive: boolean("isActive").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type UserLocation = InferSelectModel<typeof userLocation>;

// ─── BusinessRecommendation ────────────────────────────────────────────────────
export const businessRecommendation = pgTable("BusinessRecommendation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  communityId: uuid("communityId")
    .notNull()
    .references(() => community.id, { onDelete: "cascade" }),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  comment: text("comment"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type BusinessRecommendation = InferSelectModel<typeof businessRecommendation>;

// ─── UserTalent ────────────────────────────────────────────────────────────────
export const userTalent = pgTable("UserTalent", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type UserTalent = InferSelectModel<typeof userTalent>;

// ─── Gamificação ───────────────────────────────────────────────────────────────
export const userPoints = pgTable("UserPoints", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  total: integer("total").notNull().default(0),
  level: varchar("level", { length: 20 }).notNull().default("semente"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type UserPoints = InferSelectModel<typeof userPoints>;

export const userMission = pgTable("UserMission", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(),
  weekKey: varchar("weekKey", { length: 10 }).notNull(),
  completedAt: timestamp("completedAt"),
  pointsAwarded: integer("pointsAwarded").notNull().default(0),
});

export type UserMission = InferSelectModel<typeof userMission>;

