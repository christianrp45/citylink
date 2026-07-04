import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
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
  lat: varchar("lat", { length: 20 }),
  lng: varchar("lng", { length: 20 }),
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
// CITYLINK — AMIZADES E VISITAS
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
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.friendId] }),
  })
);

export type Friendship = InferSelectModel<typeof friendship>;

// ============================================================
// CITYLINK — EVENTOS
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
// CITYLINK — ALERTAS SAMARITANOS
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
    enum: ["pending", "accepted", "declined"],
  })
    .notNull()
    .default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  respondedAt: timestamp("respondedAt"),
});

export type VisitRequest = InferSelectModel<typeof visitRequest>;

// ============================================================
// CITYLINK — MÓDULO CÉLULAS
// ============================================================

export const cell = pgTable("Cell", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
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

export const cellGuide = pgTable("CellGuide", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  meetingId: uuid("meetingId")
    .notNull()
    .references(() => cellMeeting.id),
  title: text("title").notNull(),
  biblePassage: varchar("biblePassage", { length: 100 }),
  theme: text("theme"),
  icebreaker: text("icebreaker"),
  studyQuestions: json("studyQuestions").$type<string[]>(),
  application: text("application"),
  prayer: text("prayer"),
  youtubeLinks: json("youtubeLinks").$type<
    { title: string; url: string }[]
  >(),
  isPublished: boolean("isPublished").notNull().default(false),
  publishedAt: timestamp("publishedAt"),
  generatedByAI: boolean("generatedByAI").notNull().default(false),
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
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.prayerRequestId, table.userId] }),
  })
);

export type PrayerInteraction = InferSelectModel<typeof prayerInteraction>;

// ============================================================
// CITYLINK — FASE 6: PUSH NOTIFICATIONS
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
// CITYLINK — FASE 7: IGREJAS, TESTEMUNHOS, ORAÇÃO, VOLUNTARIADO
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
