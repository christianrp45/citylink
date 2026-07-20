# Graph Report - Citylink-main  (2026-07-20)

## Corpus Check
- 398 files · ~220,345 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2134 nodes · 4357 edges · 217 communities (115 shown, 102 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 311 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1a5b614e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- queries-cells.ts
- inline-citation.tsx
- cn
- schema.ts
- diff.js
- index.tsx
- 5. Roadmap Completo — Próximos Passos
- icons.tsx
- compilerOptions
- sidebar.tsx
- actions.ts
- page.tsx
- model-selector.tsx
- User
- client.tsx
- artifact.tsx
- visibility-selector.tsx
- CityLink — Roadmap de Implementação
- deletePushSubscription
- document-preview.tsx
- auth.ts
- reasoning.tsx
- route.ts
- queries.ts
- button.tsx
- text-editor.tsx
- utils.ts
- DOCUMENTACAO.md
- chat.ts
- communities.ts
- types.ts
- multimodal-input.tsx
- 1. Estado Atual — O que já está implementado e em produção
- page.tsx
- web-preview.tsx
- providers.ts
- dependencies
- client.ts
- client.tsx
- types.ts
- route.ts
- chat.tsx
- message.tsx
- server.ts
- ChatPage
- friends.ts
- route.ts
- page.tsx
- components.json
- errors.ts
- ChatMessage
- branch.tsx
- actions.ts
- data-stream-provider.tsx
- manifest.json
- events.ts
- locations.ts
- volunteer.ts
- scripts
- prayer-groups.ts
- devDependencies
- direct-messages.ts
- page.tsx
- suggestion.tsx
- constants.ts
- hospitality.ts
- visits.ts
- message.tsx
- task.tsx
- toolbar.tsx
- documents.ts
- page.tsx
- models.test.ts
- schema.ts
- page.tsx
- page.tsx
- card.tsx
- page.tsx
- layout.tsx
- button-group.tsx
- dialog.tsx
- Suggestion
- page.tsx
- page.tsx
- README.md
- vercel.json
- route.ts
- package.json
- page.tsx
- page.tsx
- page.tsx
- generate-icons.mjs
- route.ts
- get-weather.ts
- ReactRenderer
- next.config.ts
- ai
- @ai-sdk/gateway
- @ai-sdk/provider
- @ai-sdk/react
- layout.tsx
- error.tsx
- get-weather.ts
- page.tsx
- bcrypt-ts
- classnames
- clsx
- cmdk
- codemirror
- @codemirror/lang-python
- @codemirror/state
- @codemirror/theme-one-dark
- @codemirror/view
- date-fns
- dotenv
- drizzle-orm
- embla-carousel-react
- framer-motion
- geist
- @icons-pack/react-simple-icons
- leaflet
- lucide-react
- motion
- route.ts
- next
- next-env.d.ts
- next-themes
- @opentelemetry/api
- orderedmap
- papaparse
- postgres
- prosemirror-example-setup
- prosemirror-markdown
- prosemirror-model
- prosemirror-schema-basic
- prosemirror-schema-list
- prosemirror-state
- prosemirror-view
- @radix-ui/react-collapsible
- @radix-ui/react-dropdown-menu
- @radix-ui/react-icons
- @radix-ui/react-progress
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-tooltip
- @radix-ui/react-use-controllable-state
- @radix-ui/react-visually-hidden
- react-data-grid
- react-dom
- react-leaflet
- react-resizable-panels
- redis
- resumable-stream
- server-only
- shiki
- streamdown
- swr
- tailwind-merge
- tailwindcss-animate
- @types/leaflet
- use-stick-to-bottom
- usehooks-ts
- @vercel/analytics
- @vercel/blob
- @vercel/otel
- web-push
- zod
- zustand
- postcss
- tailwindcss
- tsx
- @types/d3-scale
- @types/node
- @types/react
- @types/react-dom
- @types/react-syntax-highlighter
- typescript
- ultracite
- postcss.config.mjs
- sw.js
- expect
- class-variance-authority
- @tailwindcss/postcss
- rename-emetis.sh
- rename-mdc.sh
- rename-teo.sh
- next-auth
- @opentelemetry/api-logs
- prosemirror-inputrules
- radix-ui
- @radix-ui/react-dialog
- @radix-ui/react-hover-card
- @vercel/functions
- page.tsx
- route.ts
- class-variance-authority
- @playwright/test

## God Nodes (most connected - your core abstractions)
1. `cn()` - 142 edges
2. `User` - 63 edges
3. `db` - 40 edges
4. `deleteUserAccount()` - 36 edges
5. `awardPoints()` - 27 edges
6. `deletePushSubscription()` - 26 edges
7. `sendPush()` - 25 edges
8. `Button` - 23 edges
9. `CellMember` - 21 edges
10. `ChatMessage` - 21 edges

## Surprising Connections (you probably didn't know these)
- `PureSuggestedActions()` --indirect_call--> `Suggestion`  [INFERRED]
  components/suggested-actions.tsx → lib/db/schema.ts
- `GET()` --calls--> `getAdminDashboard()`  [EXTRACTED]
  app/(chat)/api/admin/route.ts → lib/db/queries/admin-dashboard.ts
- `GET()` --indirect_call--> `ReadingPlanProgress`  [INFERRED]
  app/(chat)/api/bible/plans/route.ts → lib/db/schema.ts
- `POST()` --indirect_call--> `generateUUID()`  [INFERRED]
  app/(chat)/api/chat/route.ts → lib/utils.ts
- `GET()` --indirect_call--> `Friendship`  [INFERRED]
  app/(chat)/api/cron/birthdays/route.ts → lib/db/schema.ts

## Import Cycles
- 1-file cycle: `lib/db/queries-cells.ts -> lib/db/queries-cells.ts`
- 3-file cycle: `app/(chat)/actions.ts -> components/visibility-selector.tsx -> hooks/use-chat-visibility.ts -> app/(chat)/actions.ts`
- 3-file cycle: `components/sidebar-history-item.tsx -> hooks/use-chat-visibility.ts -> components/sidebar-history.tsx -> components/sidebar-history-item.tsx`
- 5-file cycle: `app/(chat)/actions.ts -> lib/db/queries.ts -> lib/db/queries/chat.ts -> components/visibility-selector.tsx -> hooks/use-chat-visibility.ts -> app/(chat)/actions.ts`

## Communities (217 total, 102 thin omitted)

### Community 0 - "queries-cells.ts"
Cohesion: 0.60
Nodes (4): GET(), createCellMessage(), getCellMessages(), CellMessage

### Community 1 - "inline-citation.tsx"
Cohesion: 0.05
Nodes (41): CarouselApiContext, InlineCitation(), InlineCitationCardBody(), InlineCitationCardBodyProps, InlineCitationCardProps, InlineCitationCardTrigger(), InlineCitationCardTriggerProps, InlineCitationCarousel() (+33 more)

### Community 2 - "cn"
Cohesion: 0.06
Nodes (43): Action(), ActionProps, Actions(), ActionsProps, PromptInput(), PromptInputButton(), PromptInputButtonProps, PromptInputModelSelectContent() (+35 more)

### Community 3 - "schema.ts"
Cohesion: 0.08
Nodes (22): ModelSelector(), ModelSelectorContent(), ModelSelectorItem(), ModelSelectorLogo(), ModelSelectorName(), Loader(), LoaderIconProps, LoaderProps (+14 more)

### Community 4 - "diff.js"
Cohesion: 0.09
Nodes (36): computeDiff(), DiffEditorProps, diffSchema, DiffView(), n(), SAMPLE, Weather(), WeatherAtLocation (+28 more)

### Community 6 - "5. Roadmap Completo — Próximos Passos"
Cohesion: 0.05
Nodes (36): 10. Decisões Arquiteturais Registradas, 1. Missão e Visão, 2. Stack Tecnológica, 3. O que já foi implementado (Fases 1–7), 4.1 Novas tabelas, 4.2 Tabelas existentes a alterar, 4. Modelo de Dados Aprovado — v2 (A IMPLEMENTAR), 5. Roadmap Completo — Próximos Passos (+28 more)

### Community 7 - "icons.tsx"
Cohesion: 0.05
Nodes (21): codeArtifact, imageArtifact, Metadata, sheetArtifact, textArtifact, TextArtifactMetadata, ClockRewind(), CopyIcon() (+13 more)

### Community 8 - "compilerOptions"
Cohesion: 0.06
Nodes (33): ./*, dom, dom.iterable, esnext, next.config.js, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+25 more)

### Community 9 - "sidebar.tsx"
Cohesion: 0.06
Nodes (31): DataStreamProvider(), SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+23 more)

### Community 10 - "actions.ts"
Cohesion: 0.08
Nodes (37): authFormSchema, createResetToken(), forgotPassword(), ForgotPasswordActionState, login(), LoginActionState, register(), RegisterActionState (+29 more)

### Community 11 - "page.tsx"
Cohesion: 0.06
Nodes (31): ALERT_COLOR, ALERT_LABEL, AlertItem, avatarSrc(), CommunityPage(), DiscoverCard(), DiscoverUser, Friend (+23 more)

### Community 12 - "model-selector.tsx"
Cohesion: 0.06
Nodes (34): ModelSelectorContentProps, ModelSelectorDialogProps, ModelSelectorEmptyProps, ModelSelectorGroup(), ModelSelectorGroupProps, ModelSelectorInput(), ModelSelectorInputProps, ModelSelectorItemProps (+26 more)

### Community 13 - "User"
Cohesion: 0.17
Nodes (23): AppSidebar(), Chat(), DataStreamHandler(), DataStreamContext, DataStreamContextValue, useDataStream(), getChatHistoryPaginationKey(), groupChatsByDate() (+15 more)

### Community 14 - "client.tsx"
Cohesion: 0.13
Nodes (13): Metadata, OUTPUT_HANDLERS, CodeEditor, EditorProps, NOTE: we only want to run this effect once, Console(), ConsoleOutput, ConsoleOutputContent (+5 more)

### Community 15 - "artifact.tsx"
Cohesion: 0.09
Nodes (29): ArtifactActions, ArtifactActionsProps, PureArtifactActions(), Artifact, ArtifactCloseButton, PureArtifactCloseButton(), NOTE: if there are no documents, or if, CrossIcon() (+21 more)

### Community 16 - "visibility-selector.tsx"
Cohesion: 0.11
Nodes (26): ChevronDownIcon(), GlobeIcon(), LockIcon(), MoreHorizontalIcon(), ShareIcon(), TrashIcon(), ChatHistory, ChatItem (+18 more)

### Community 17 - "CityLink — Roadmap de Implementação"
Cohesion: 0.07
Nodes (27): 1. Visão do Produto, 2.1 Páginas implementadas, 2.2 Backend implementado, 2.3 Tabelas existentes no banco, 2.4 Variáveis de ambiente necessárias (Vercel), 2. Estado Atual do App (julho 2026), 3. O que Falta para o App Funcionar de Verdade, 4. Resumo Executivo de Prioridades (+19 more)

### Community 18 - "deletePushSubscription"
Cohesion: 0.12
Nodes (34): ALERT_PUSH, GET(), POST(), GET(), GET(), GET(), GET(), POST() (+26 more)

### Community 19 - "document-preview.tsx"
Cohesion: 0.09
Nodes (20): DocumentToolCall, DocumentToolCallProps, DocumentToolResult, DocumentToolResultProps, getActionText(), DocumentContent(), DocumentHeader, DocumentPreview() (+12 more)

### Community 20 - "auth.ts"
Cohesion: 0.27
Nodes (10): deleteTrailingMessages(), generateTitleFromUserMessage(), updateChatVisibility(), MessageEditor(), MessageEditorProps, getTitleModel(), deleteMessagesByChatIdAfterTimestamp(), getMessageById() (+2 more)

### Community 21 - "reasoning.tsx"
Cohesion: 0.19
Nodes (12): PureArtifact(), ChatHeader, PureChatHeader(), PlusIcon(), SidebarLeftIcon(), VercelIcon(), SidebarToggle(), useCarousel() (+4 more)

### Community 22 - "route.ts"
Cohesion: 0.16
Nodes (12): UserType, filePartSchema, messageSchema, partSchema, PostRequestBody, postRequestBodySchema, textPartSchema, userMessageSchema (+4 more)

### Community 23 - "queries.ts"
Cohesion: 0.35
Nodes (8): POST(), POST(), getRequestPromptFromHints(), RequestHints, systemPrompt(), teoWithPassagePrompt(), getFreeModel(), getMessageCountByUserId()

### Community 24 - "button.tsx"
Cohesion: 0.21
Nodes (9): Suggestion(), SuggestionProps, Suggestions(), SuggestionsProps, PureSuggestedActions(), SuggestedActions, SuggestedActionsProps, ScrollArea (+1 more)

### Community 25 - "text-editor.tsx"
Cohesion: 0.21
Nodes (16): EditorProps, PureEditor(), NOTE: we only want to run this effect once, documentSchema, handleTransaction(), headingRule(), buildContentFromDocument(), buildDocumentFromContent() (+8 more)

### Community 26 - "utils.ts"
Cohesion: 0.08
Nodes (17): Image(), ImageProps, Alert, AlertDescription, AlertTitle, alertVariants, ButtonGroup(), ButtonGroupSeparator() (+9 more)

### Community 27 - "DOCUMENTACAO.md"
Cohesion: 0.08
Nodes (23): 10. Notificações, 1. Autenticação, 2. Mapa (MapPage), 3. Sistema de Visitas, 4. Amigos (FriendsPage), 5. Empresas (BusinessPage), 6. Eventos (EventsPage), 7. Chat (ChatPage) (+15 more)

### Community 28 - "chat.ts"
Cohesion: 0.15
Nodes (24): DELETE(), POST(), DELETE(), GET(), GET(), PATCH(), ChatPage(), createStreamId() (+16 more)

### Community 29 - "communities.ts"
Cohesion: 0.10
Nodes (35): GET(), POST(), GET(), POST(), DELETE(), POST(), GET(), GET() (+27 more)

### Community 30 - "types.ts"
Cohesion: 0.09
Nodes (20): getWeather, AvailabilityStatus, Business, CellMeetingWithGuide, CellMemberDetail, CellMemberRole, ChatTools, CommunityEvent (+12 more)

### Community 31 - "multimodal-input.tsx"
Cohesion: 0.19
Nodes (13): POST(), PATCH(), POST(), DELETE(), GET(), GET(), acceptFriendRequest(), getFriends() (+5 more)

### Community 32 - "1. Estado Atual — O que já está implementado e em produção"
Cohesion: 0.08
Nodes (24): 1. Estado Atual — Tudo implementado e em produção, 2. Banco de Dados — Migrações, 3. Gamificação — Missões e Níveis, 4. Padrões Técnicos Importantes, 5. Arquivos Críticos de Referência, 6. Navegação (Bottom Nav — 5 abas), 7. Decisões Arquiteturais, AI SDK v6 — Route handler com streaming (+16 more)

### Community 33 - "page.tsx"
Cohesion: 0.12
Nodes (28): DELETE(), GET(), POST(), GET(), PATCH(), GET(), POST(), DELETE() (+20 more)

### Community 34 - "web-preview.tsx"
Cohesion: 0.15
Nodes (14): useWebPreview(), WebPreview(), WebPreviewBody(), WebPreviewBodyProps, WebPreviewConsole(), WebPreviewConsoleProps, WebPreviewContext, WebPreviewContextValue (+6 more)

### Community 35 - "providers.ts"
Cohesion: 0.21
Nodes (10): artifactModel, chatModel, createMockModel(), getResponseForPrompt(), mockResponses, mockUsage, reasoningModel, titleModel (+2 more)

### Community 36 - "dependencies"
Cohesion: 0.10
Nodes (21): ai, @ai-sdk/provider, codemirror, @codemirror/lang-javascript, nanoid, dependencies, ai, @ai-sdk/provider (+13 more)

### Community 37 - "client.ts"
Cohesion: 0.15
Nodes (16): GET(), GET(), NotificationItem, GET(), GET(), countPendingVisits(), createVisitRequest(), getAcceptedVisitsAsSender() (+8 more)

### Community 38 - "client.tsx"
Cohesion: 0.17
Nodes (7): ArrowUpIcon(), StopIcon(), SummarizeIcon(), randomArr, Toolbar, ToolProps, TooltipContent

### Community 39 - "types.ts"
Cohesion: 0.20
Nodes (9): Artifact, ArtifactAction, ArtifactActionContext, ArtifactConfig, ArtifactContent, ArtifactToolbarContext, ArtifactToolbarItem, InitializeParameters (+1 more)

### Community 40 - "route.ts"
Cohesion: 0.13
Nodes (14): client, db, GET(), POST(), ALL_BOOKS, PlanWithProgress, QUICK_BOOKS, VerseOfDay (+6 more)

### Community 41 - "chat.tsx"
Cohesion: 0.52
Nodes (5): GET(), POST(), getBusinessRecommendations(), toggleBusinessRecommendation(), BusinessRecommendation

### Community 42 - "message.tsx"
Cohesion: 0.08
Nodes (28): Reasoning, ReasoningContent, ReasoningContentProps, ReasoningContext, ReasoningContextValue, ReasoningProps, ReasoningTrigger, ReasoningTriggerProps (+20 more)

### Community 43 - "server.ts"
Cohesion: 0.13
Nodes (22): codeDocumentHandler, sheetDocumentHandler, textDocumentHandler, updateDocumentPrompt(), getArtifactModel(), createDocument(), CreateDocumentProps, requestSuggestions() (+14 more)

### Community 44 - "ChatPage"
Cohesion: 0.15
Nodes (3): Fixtures, test, ChatPage

### Community 45 - "friends.ts"
Cohesion: 0.06
Nodes (29): {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
}, JWT, next-auth, next-auth/jwt, Session, User, GET(), POST() (+21 more)

### Community 46 - "route.ts"
Cohesion: 0.22
Nodes (8): NAV_ITEMS, NavIcon, IconBible(), IconChat(), IconCommunity(), IconGroups(), IconMap(), IconProfile()

### Community 47 - "page.tsx"
Cohesion: 0.14
Nodes (14): AcceptedVisit, apiFetch(), AvailabilityStatus, FriendWithCircle, PendingVisit, PrivacySettings, ProfilePage(), ProximityConfig (+6 more)

### Community 48 - "components.json"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 49 - "errors.ts"
Cohesion: 0.14
Nodes (19): DELETE(), GET(), POST(), GET(), getSuggestions(), ArtifactKind, deleteDocumentsByIdAfterTimestamp(), getDocumentsById() (+11 more)

### Community 50 - "ChatMessage"
Cohesion: 0.21
Nodes (10): ArtifactMessages, ArtifactMessagesProps, PureArtifactMessages(), Greeting(), ThinkingMessage(), MessagesProps, PureMessages(), useMessages() (+2 more)

### Community 51 - "branch.tsx"
Cohesion: 0.17
Nodes (15): Branch(), BranchContext, BranchContextType, BranchMessages(), BranchMessagesProps, BranchNext(), BranchNextProps, BranchPage() (+7 more)

### Community 52 - "actions.ts"
Cohesion: 0.25
Nodes (12): DELETE(), GET(), GET(), POST(), createTalent(), deleteTalent(), getMyTalents(), getTalentById() (+4 more)

### Community 53 - "data-stream-provider.tsx"
Cohesion: 0.09
Nodes (17): avatarSrc(), avatarUrl(), CommunitiesTab(), COMMUNITY_TYPE_EMOJI, COMMUNITY_TYPE_LABEL, COMMUNITY_TYPES, CommunityItem, CommunityMemberItem (+9 more)

### Community 54 - "manifest.json"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lang, name, orientation (+6 more)

### Community 55 - "events.ts"
Cohesion: 0.36
Nodes (9): POST(), GET(), POST(), createEvent(), getEvents(), getMyEventIds(), joinEvent(), leaveEvent() (+1 more)

### Community 56 - "locations.ts"
Cohesion: 0.30
Nodes (11): DELETE(), PATCH(), GET(), POST(), addUserLocation(), deactivateAllUserLocations(), deleteUserLocation(), getActiveUserLocation() (+3 more)

### Community 57 - "volunteer.ts"
Cohesion: 0.34
Nodes (11): POST(), GET(), POST(), createVolunteerOpportunity(), enrollVolunteer(), getMyEnrollmentIds(), getVolunteerEnrollmentCounts(), getVolunteerOpportunities() (+3 more)

### Community 58 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, db:check, db:generate, db:migrate, db:pull, db:push, db:studio (+6 more)

### Community 59 - "prayer-groups.ts"
Cohesion: 0.37
Nodes (10): POST(), GET(), POST(), createPrayerGroup(), getMyPrayerGroupIds(), getPrayerGroups(), joinPrayerGroup(), leavePrayerGroup() (+2 more)

### Community 60 - "devDependencies"
Cohesion: 0.15
Nodes (13): @biomejs/biome, drizzle-kit, devDependencies, @biomejs/biome, drizzle-kit, @tailwindcss/typography, @types/papaparse, @types/pdf-parse (+5 more)

### Community 61 - "direct-messages.ts"
Cohesion: 0.48
Nodes (6): ActiveWhenOption, GET(), PATCH(), VALID_ACTIVE_WHEN, getUserProximityConfig(), upsertUserProximityConfig()

### Community 62 - "page.tsx"
Cohesion: 0.20
Nodes (10): BOOK_MAP, EMPTY_FORM, EMPTY_POINT, GuideForm, GuidePage(), parseBiblePassageUrl(), parseSermonText(), CellGuideDetail (+2 more)

### Community 63 - "suggestion.tsx"
Cohesion: 0.24
Nodes (10): GET(), GET(), POST(), GET(), countUnreadMessages(), getConversations(), getMessageHistory(), markMessagesAsRead() (+2 more)

### Community 64 - "constants.ts"
Cohesion: 0.20
Nodes (7): AUDIENCE_LABEL, CellResult, CommunityResult, EVENT_EMOJI, EventResult, SearchResults, UserResult

### Community 65 - "hospitality.ts"
Cohesion: 0.20
Nodes (12): GET(), PATCH(), EmetisLayout(), BottomNav(), TeoFAB(), ActiveWhenOption, getUserPrivacySettings(), logConsent() (+4 more)

### Community 66 - "visits.ts"
Cohesion: 0.47
Nodes (4): GET(), DAILY_VERSES, DailyVerse, getVerseOfDay()

### Community 67 - "message.tsx"
Cohesion: 0.24
Nodes (9): Message(), MessageAvatar(), MessageAvatarProps, MessageContent(), MessageContentProps, MessageProps, Avatar, AvatarFallback (+1 more)

### Community 68 - "task.tsx"
Cohesion: 0.10
Nodes (16): SourceProps, Sources(), SourcesContent(), SourcesContentProps, SourcesProps, SourcesTriggerProps, Task(), TaskContent() (+8 more)

### Community 69 - "toolbar.tsx"
Cohesion: 0.13
Nodes (39): GET(), POST(), GET(), GET(), client, db, deleteUserAccount(), getAdminDashboard() (+31 more)

### Community 70 - "documents.ts"
Cohesion: 0.18
Nodes (11): ChapterData, FONT_SIZE_CLASS, FONT_SIZE_LABEL, FontSize, Highlight, Verse, drawVerseCard(), ShareVerseModal() (+3 more)

### Community 71 - "page.tsx"
Cohesion: 0.22
Nodes (4): ConsentState, VISIBILITY_LABELS, VisibilityOption, VisibilityState

### Community 72 - "models.test.ts"
Cohesion: 0.25
Nodes (7): artifactModel, chatModel, mockUsage, reasoningModel, titleModel, getResponseChunksByPrompt(), mockUsage

### Community 73 - "schema.ts"
Cohesion: 0.29
Nodes (6): Conversation(), ConversationContent(), ConversationContentProps, ConversationProps, ConversationScrollButton(), ConversationScrollButtonProps

### Community 74 - "page.tsx"
Cohesion: 0.39
Nodes (7): avatarSrc(), ChatPage(), Conversation, ConversationView(), ConvMessage, formatTime(), Partner

### Community 75 - "page.tsx"
Cohesion: 0.25
Nodes (15): GET(), notifyPair(), GET(), getFriendCircles(), createProximityAlert(), deleteExpiredProximityAlerts(), getActiveCommunityMemberPairs(), getActiveFriendPairs() (+7 more)

### Community 76 - "card.tsx"
Cohesion: 0.25
Nodes (7): Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 77 - "page.tsx"
Cohesion: 0.33
Nodes (5): EventItem, EventsPage(), EventType, formatDate(), TYPE_MAP

### Community 78 - "layout.tsx"
Cohesion: 0.33
Nodes (4): jakartaSans, metadata, viewport, ThemeProvider()

### Community 79 - "button-group.tsx"
Cohesion: 0.44
Nodes (8): DELETE(), GET(), POST(), deleteHighlight(), getUserHighlights(), getVerseHighlights(), upsertHighlight(), BibleHighlight

### Community 80 - "dialog.tsx"
Cohesion: 0.29
Nodes (7): AdminPage(), attendanceColor(), CellStat, CommunityInfo, DashboardData, DAY_NAMES, RecentMeeting

### Community 81 - "Suggestion"
Cohesion: 0.32
Nodes (6): avgRate(), CellDashboard(), CellData, formatDate(), InactiveMember, MeetingHistory

### Community 82 - "page.tsx"
Cohesion: 0.47
Nodes (4): POST(), getQuebraGelosParaPrompt(), QuebraGelo, quebraGelos

### Community 83 - "page.tsx"
Cohesion: 0.33
Nodes (4): AUDIENCE_OPTIONS, WEEKDAYS, CellSummary, CellTargetAudience

### Community 84 - "README.md"
Cohesion: 0.33
Nodes (5): AI Gateway Authentication, Deploy Your Own, Features, Model Providers, Running locally

### Community 85 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, crons, framework, installCommand, outputDirectory

### Community 86 - "route.ts"
Cohesion: 0.50
Nodes (4): ABBREV_MAP, BibleBook, fetchBible(), GET()

### Community 87 - "package.json"
Cohesion: 0.40
Nodes (4): name, packageManager, private, version

### Community 88 - "page.tsx"
Cohesion: 0.33
Nodes (4): InvitePreview, typeIcon, typeLabel, typeRoute

### Community 91 - "generate-icons.mjs"
Cohesion: 0.67
Nodes (3): __dirname, generate(), makeSvg()

### Community 92 - "route.ts"
Cohesion: 0.40
Nodes (5): avatarSrc(), LEVEL_EMOJI, MEDAL, RankEntry, RankingPage()

### Community 97 - "ai"
Cohesion: 0.60
Nodes (4): GET(), POST(), getAttendanceByMeeting(), markAttendance()

### Community 99 - "@ai-sdk/provider"
Cohesion: 0.50
Nodes (4): avatarSrc(), CATEGORY_EMOJI, TalentDetail, TalentPublicPage()

### Community 112 - "codemirror"
Cohesion: 0.33
Nodes (6): NotificationItem, NotificationsPage(), NotifType, timeAgo(), TYPE_BG, TYPE_ICON

### Community 131 - "route.ts"
Cohesion: 0.43
Nodes (7): GET(), PATCH(), VALID_OPTIONS, VisibilityOption, getUserVisibilityConfig(), upsertUserVisibilityConfig(), UserVisibilityConfig

### Community 152 - "@radix-ui/react-separator"
Cohesion: 0.33
Nodes (4): CellInfo, LevelInfo, PublicProfile, STATUS_LABEL

### Community 159 - "react-leaflet"
Cohesion: 0.40
Nodes (3): CATEGORIES, CATEGORY_EMOJI, Talent

### Community 218 - "page.tsx"
Cohesion: 0.60
Nodes (4): avatarSrc(), CellChatMessage, CellChatPage(), formatTime()

## Knowledge Gaps
- **683 isolated node(s):** `authFormSchema`, `registerFormSchema`, `next-auth`, `Session`, `User` (+678 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **102 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `lucide-react`, `motion`, `diff.js`, `next`, `next-themes`, `@opentelemetry/api`, `orderedmap`, `papaparse`, `postgres`, `prosemirror-example-setup`, `prosemirror-markdown`, `prosemirror-model`, `prosemirror-schema-basic`, `prosemirror-schema-list`, `prosemirror-state`, `prosemirror-view`, `@radix-ui/react-collapsible`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-icons`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `reasoning.tsx`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-use-controllable-state`, `@radix-ui/react-visually-hidden`, `react-data-grid`, `react-dom`, `react-resizable-panels`, `redis`, `resumable-stream`, `server-only`, `shiki`, `streamdown`, `swr`, `tailwind-merge`, `tailwindcss-animate`, `@types/leaflet`, `use-stick-to-bottom`, `usehooks-ts`, `@vercel/analytics`, `@vercel/blob`, `@vercel/otel`, `web-push`, `zod`, `zustand`, `class-variance-authority`, `next-auth`, `@opentelemetry/api-logs`, `prosemirror-inputrules`, `radix-ui`, `@radix-ui/react-dialog`, `@radix-ui/react-hover-card`, `package.json`, `@vercel/functions`, `class-variance-authority`, `@ai-sdk/react`, `get-weather.ts`, `page.tsx`, `bcrypt-ts`, `classnames`, `clsx`, `cmdk`, `@codemirror/lang-python`, `@codemirror/state`, `@codemirror/theme-one-dark`, `@codemirror/view`, `date-fns`, `dotenv`, `drizzle-orm`, `embla-carousel-react`, `framer-motion`, `geist`, `@icons-pack/react-simple-icons`, `leaflet`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `react` connect `reasoning.tsx` to `sidebar.tsx`, `dependencies`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Why does `useSidebar()` connect `reasoning.tsx` to `sidebar.tsx`, `User`, `artifact.tsx`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Are the 36 inferred relationships involving `User` (e.g. with `GET()` and `GET()`) actually correct?**
  _`User` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `deleteUserAccount()` (e.g. with `AlertResponse` and `BibleHighlight`) actually correct?**
  _`deleteUserAccount()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **What connects `authFormSchema`, `registerFormSchema`, `next-auth` to the rest of the system?**
  _683 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inline-citation.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._