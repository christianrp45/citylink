# Graph Report - Citylink-main  (2026-07-19)

## Corpus Check
- 358 files · ~202,921 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1985 nodes · 3961 edges · 209 communities (108 shown, 101 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 259 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81c11304`
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
- loading.tsx
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
- nanoid
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
- react-syntax-highlighter
- redis
- resumable-stream
- server-only
- shiki
- sonner
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
- @playwright/test
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 142 edges
2. `User` - 44 edges
3. `deleteUserAccount()` - 36 edges
4. `db` - 29 edges
5. `Button` - 23 edges
6. `ChatMessage` - 21 edges
7. `Suggestion` - 19 edges
8. `deletePushSubscription()` - 18 edges
9. `getCellById()` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getAlerts()`  [EXTRACTED]
  app/(chat)/api/alerts/route.ts → lib/db/queries/alerts.ts
- `GET()` --indirect_call--> `ReadingPlanProgress`  [INFERRED]
  app/(chat)/api/bible/plans/route.ts → lib/db/schema.ts
- `DELETE()` --calls--> `deleteUserAccount()`  [EXTRACTED]
  app/(chat)/api/users/delete-account/route.ts → lib/db/queries/account.ts
- `GET()` --calls--> `getUserById()`  [EXTRACTED]
  app/(chat)/api/users/me/route.ts → lib/db/queries/users.ts
- `EmetisLayout()` --calls--> `getUserPrivacySettings()`  [EXTRACTED]
  app/(emetis)/layout.tsx → lib/db/queries/privacy.ts

## Import Cycles
- 1-file cycle: `lib/db/queries-cells.ts -> lib/db/queries-cells.ts`
- 3-file cycle: `app/(chat)/actions.ts -> components/visibility-selector.tsx -> hooks/use-chat-visibility.ts -> app/(chat)/actions.ts`
- 3-file cycle: `components/sidebar-history-item.tsx -> hooks/use-chat-visibility.ts -> components/sidebar-history.tsx -> components/sidebar-history-item.tsx`
- 5-file cycle: `app/(chat)/actions.ts -> lib/db/queries.ts -> lib/db/queries/chat.ts -> components/visibility-selector.tsx -> hooks/use-chat-visibility.ts -> app/(chat)/actions.ts`

## Communities (209 total, 101 thin omitted)

### Community 0 - "queries-cells.ts"
Cohesion: 0.19
Nodes (17): GET(), POST(), GET(), PATCH(), GET(), POST(), client, db (+9 more)

### Community 1 - "inline-citation.tsx"
Cohesion: 0.05
Nodes (41): CarouselApiContext, InlineCitation(), InlineCitationCardBody(), InlineCitationCardBodyProps, InlineCitationCardProps, InlineCitationCardTrigger(), InlineCitationCardTriggerProps, InlineCitationCarousel() (+33 more)

### Community 2 - "cn"
Cohesion: 0.06
Nodes (40): Action(), ActionProps, Actions(), ActionsProps, Conversation(), ConversationContent(), ConversationContentProps, ConversationProps (+32 more)

### Community 3 - "schema.ts"
Cohesion: 0.15
Nodes (27): POST(), GET(), POST(), GET(), POST(), deleteUserAccount(), createPrayerRequest(), getPrayerRequestsByCell() (+19 more)

### Community 4 - "diff.js"
Cohesion: 0.09
Nodes (36): computeDiff(), DiffEditorProps, diffSchema, DiffView(), n(), SAMPLE, Weather(), WeatherAtLocation (+28 more)

### Community 5 - "index.tsx"
Cohesion: 0.05
Nodes (11): EmetisLayout(), BottomNav(), NAV_ITEMS, NavIcon, IconBible(), IconChat(), IconCommunity(), IconGroups() (+3 more)

### Community 6 - "5. Roadmap Completo — Próximos Passos"
Cohesion: 0.05
Nodes (36): 10. Decisões Arquiteturais Registradas, 1. Missão e Visão, 2. Stack Tecnológica, 3. O que já foi implementado (Fases 1–7), 4.1 Novas tabelas, 4.2 Tabelas existentes a alterar, 4. Modelo de Dados Aprovado — v2 (A IMPLEMENTAR), 5. Roadmap Completo — Próximos Passos (+28 more)

### Community 7 - "icons.tsx"
Cohesion: 0.07
Nodes (5): CopyIcon(), PencilEditIcon(), ThumbDownIcon(), ThumbUpIcon(), MessageActions

### Community 8 - "compilerOptions"
Cohesion: 0.06
Nodes (33): ./*, dom, dom.iterable, esnext, next.config.js, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+25 more)

### Community 9 - "sidebar.tsx"
Cohesion: 0.06
Nodes (33): DataStreamContext, DataStreamContextValue, DataStreamProvider(), SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader() (+25 more)

### Community 10 - "actions.ts"
Cohesion: 0.07
Nodes (38): authFormSchema, createResetToken(), forgotPassword(), ForgotPasswordActionState, login(), LoginActionState, register(), RegisterActionState (+30 more)

### Community 11 - "page.tsx"
Cohesion: 0.08
Nodes (25): ALERT_COLOR, ALERT_LABEL, AlertItem, avatarSrc(), CommunityPage(), DiscoverCard(), DiscoverUser, Friend (+17 more)

### Community 12 - "model-selector.tsx"
Cohesion: 0.10
Nodes (15): ModelSelectorContentProps, ModelSelectorDialogProps, ModelSelectorEmptyProps, ModelSelectorGroupProps, ModelSelectorInputProps, ModelSelectorItemProps, ModelSelectorListProps, ModelSelectorLogoGroup() (+7 more)

### Community 13 - "User"
Cohesion: 0.21
Nodes (17): GET(), notifyPair(), GET(), getAlerts(), resolveAlert(), getFriendCircles(), createProximityAlert(), deleteExpiredProximityAlerts() (+9 more)

### Community 14 - "client.tsx"
Cohesion: 0.16
Nodes (12): Console(), ConsoleOutput, ConsoleOutputContent, ConsoleProps, Loader(), LoaderIconProps, LoaderProps, CrossSmallIcon() (+4 more)

### Community 15 - "artifact.tsx"
Cohesion: 0.13
Nodes (21): ArtifactActions, ArtifactActionsProps, PureArtifactActions(), Artifact, ArtifactCloseButton, PureArtifactCloseButton(), PureArtifact(), NOTE: if there are no documents, or if (+13 more)

### Community 16 - "visibility-selector.tsx"
Cohesion: 0.12
Nodes (23): ChevronDownIcon(), GlobeIcon(), LockIcon(), MoreHorizontalIcon(), ShareIcon(), TrashIcon(), ChatItem, PureChatItem() (+15 more)

### Community 17 - "CityLink — Roadmap de Implementação"
Cohesion: 0.07
Nodes (27): 1. Visão do Produto, 2.1 Páginas implementadas, 2.2 Backend implementado, 2.3 Tabelas existentes no banco, 2.4 Variáveis de ambiente necessárias (Vercel), 2. Estado Atual do App (julho 2026), 3. O que Falta para o App Funcionar de Verdade, 4. Resumo Executivo de Prioridades (+19 more)

### Community 18 - "deletePushSubscription"
Cohesion: 0.17
Nodes (21): ALERT_PUSH, GET(), POST(), POST(), POST(), DELETE(), POST(), POST() (+13 more)

### Community 19 - "document-preview.tsx"
Cohesion: 0.09
Nodes (21): CodeEditor, EditorProps, NOTE: we only want to run this effect once, DocumentToolCall, DocumentToolCallProps, DocumentToolResult, DocumentToolResultProps, getActionText() (+13 more)

### Community 20 - "auth.ts"
Cohesion: 0.08
Nodes (21): {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
}, JWT, next-auth, next-auth/jwt, Session, User, POST(), GET() (+13 more)

### Community 21 - "reasoning.tsx"
Cohesion: 0.16
Nodes (12): Reasoning, ReasoningContent, ReasoningContentProps, ReasoningContext, ReasoningContextValue, ReasoningProps, ReasoningTrigger, ReasoningTriggerProps (+4 more)

### Community 22 - "route.ts"
Cohesion: 0.15
Nodes (18): UserType, DELETE(), POST(), ChatPage(), DataStreamHandler(), Entitlements, entitlementsByUserType, TODO: For users with an account and a paid membership (+10 more)

### Community 23 - "queries.ts"
Cohesion: 0.17
Nodes (17): GET(), POST(), DELETE(), GET(), POST(), POST(), createChurch(), getChurchById() (+9 more)

### Community 24 - "button.tsx"
Cohesion: 0.21
Nodes (11): ChatHeader, PureChatHeader(), PlusIcon(), SidebarLeftIcon(), VercelIcon(), SidebarToggle(), useCarousel(), SidebarTrigger (+3 more)

### Community 25 - "text-editor.tsx"
Cohesion: 0.21
Nodes (16): EditorProps, PureEditor(), NOTE: we only want to run this effect once, documentSchema, handleTransaction(), headingRule(), buildContentFromDocument(), buildDocumentFromContent() (+8 more)

### Community 26 - "utils.ts"
Cohesion: 0.11
Nodes (13): Image(), ImageProps, MessageEditor(), MessageEditorProps, Alert, AlertDescription, AlertTitle, alertVariants (+5 more)

### Community 27 - "DOCUMENTACAO.md"
Cohesion: 0.08
Nodes (23): 10. Notificações, 1. Autenticação, 2. Mapa (MapPage), 3. Sistema de Visitas, 4. Amigos (FriendsPage), 5. Empresas (BusinessPage), 6. Eventos (EventsPage), 7. Chat (ChatPage) (+15 more)

### Community 28 - "chat.ts"
Cohesion: 0.22
Nodes (16): DELETE(), GET(), GET(), PATCH(), createStreamId(), deleteAllChatsByUserId(), deleteChatById(), getChatsByUserId() (+8 more)

### Community 29 - "communities.ts"
Cohesion: 0.21
Nodes (18): GET(), POST(), DELETE(), POST(), GET(), GET(), POST(), approveCommunityMember() (+10 more)

### Community 30 - "types.ts"
Cohesion: 0.10
Nodes (19): AvailabilityStatus, Business, CellMeetingWithGuide, CellMemberDetail, CellMemberRole, ChatTools, CommunityEvent, createDocumentTool (+11 more)

### Community 31 - "multimodal-input.tsx"
Cohesion: 0.09
Nodes (21): ModelSelector(), ModelSelectorContent(), ModelSelectorGroup(), ModelSelectorInput(), ModelSelectorItem(), ModelSelectorList(), ModelSelectorLogo(), ModelSelectorName() (+13 more)

### Community 32 - "1. Estado Atual — O que já está implementado e em produção"
Cohesion: 0.08
Nodes (23): 1. Estado Atual — O que já está implementado e em produção, 2. Banco de Dados — Migrações Aplicadas, 3. O que ainda falta implementar, 4. Padrões Técnicos Importantes, 5. Arquivos Críticos de Referência, 6. Navegação Atual (Bottom Nav — 5 abas), 7. Decisões Arquiteturais Recentes, AI SDK v6 — Route handler com streaming (+15 more)

### Community 33 - "page.tsx"
Cohesion: 0.13
Nodes (24): DELETE(), GET(), GET(), POST(), DELETE(), GET(), POST(), PATCH() (+16 more)

### Community 34 - "web-preview.tsx"
Cohesion: 0.15
Nodes (14): useWebPreview(), WebPreview(), WebPreviewBody(), WebPreviewBodyProps, WebPreviewConsole(), WebPreviewConsoleProps, WebPreviewContext, WebPreviewContextValue (+6 more)

### Community 35 - "providers.ts"
Cohesion: 0.16
Nodes (16): POST(), POST(), artifactModel, chatModel, createMockModel(), getResponseForPrompt(), mockResponses, mockUsage (+8 more)

### Community 36 - "dependencies"
Cohesion: 0.10
Nodes (21): @codemirror/lang-javascript, fast-deep-equal, katex, next-auth, @opentelemetry/api-logs, dependencies, @codemirror/lang-javascript, fast-deep-equal (+13 more)

### Community 37 - "client.ts"
Cohesion: 0.29
Nodes (10): DELETE(), GET(), POST(), FileSchema, POST(), deleteHighlight(), getUserHighlights(), getVerseHighlights() (+2 more)

### Community 38 - "client.tsx"
Cohesion: 0.07
Nodes (31): codeArtifact, Metadata, OUTPUT_HANDLERS, imageArtifact, Metadata, sheetArtifact, textArtifact, TextArtifactMetadata (+23 more)

### Community 39 - "types.ts"
Cohesion: 0.20
Nodes (9): Artifact, ArtifactAction, ArtifactActionContext, ArtifactConfig, ArtifactContent, ArtifactToolbarContext, ArtifactToolbarItem, InitializeParameters (+1 more)

### Community 40 - "route.ts"
Cohesion: 0.13
Nodes (14): client, db, GET(), POST(), ALL_BOOKS, PlanWithProgress, QUICK_BOOKS, VerseOfDay (+6 more)

### Community 41 - "chat.tsx"
Cohesion: 0.16
Nodes (24): AppSidebar(), Chat(), useDataStream(), ChatHistory, getChatHistoryPaginationKey(), groupChatsByDate(), GroupedChats, SidebarHistory() (+16 more)

### Community 42 - "message.tsx"
Cohesion: 0.15
Nodes (17): MessageContent(), getStatusBadge(), Tool(), ToolContent(), ToolContentProps, ToolHeader(), ToolHeaderProps, ToolInput() (+9 more)

### Community 43 - "server.ts"
Cohesion: 0.21
Nodes (12): codeDocumentHandler, sheetDocumentHandler, textDocumentHandler, getRequestPromptFromHints(), RequestHints, systemPrompt(), updateDocumentPrompt(), CreateDocumentCallbackProps (+4 more)

### Community 44 - "ChatPage"
Cohesion: 0.15
Nodes (3): Fixtures, test, ChatPage

### Community 45 - "friends.ts"
Cohesion: 0.22
Nodes (12): POST(), PATCH(), POST(), DELETE(), GET(), acceptFriendRequest(), getFriends(), getFriendshipStatus() (+4 more)

### Community 46 - "route.ts"
Cohesion: 0.13
Nodes (24): GET(), GET(), PATCH(), ActiveWhenOption, GET(), PATCH(), VALID_ACTIVE_WHEN, GET() (+16 more)

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
Nodes (9): ArtifactMessages, ArtifactMessagesProps, PureArtifactMessages(), Greeting(), ThinkingMessage(), MessagesProps, PureMessages(), useMessages() (+1 more)

### Community 51 - "branch.tsx"
Cohesion: 0.17
Nodes (15): Branch(), BranchContext, BranchContextType, BranchMessages(), BranchMessagesProps, BranchNext(), BranchNextProps, BranchPage() (+7 more)

### Community 52 - "actions.ts"
Cohesion: 0.33
Nodes (7): deleteTrailingMessages(), generateTitleFromUserMessage(), updateChatVisibility(), getTitleModel(), deleteMessagesByChatIdAfterTimestamp(), getMessageById(), updateChatVisibilityById()

### Community 53 - "data-stream-provider.tsx"
Cohesion: 0.10
Nodes (16): avatarSrc(), avatarUrl(), CommunitiesTab(), COMMUNITY_TYPE_EMOJI, COMMUNITY_TYPE_LABEL, COMMUNITY_TYPES, CommunityItem, CommunityMemberItem (+8 more)

### Community 54 - "manifest.json"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lang, name, orientation (+6 more)

### Community 55 - "events.ts"
Cohesion: 0.35
Nodes (10): POST(), GET(), POST(), createEvent(), getEvents(), getMyEventIds(), joinEvent(), leaveEvent() (+2 more)

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
Cohesion: 0.29
Nodes (9): GET(), POST(), GET(), countUnreadMessages(), getConversations(), getMessageHistory(), markMessagesAsRead(), sendDirectMessage() (+1 more)

### Community 62 - "page.tsx"
Cohesion: 0.20
Nodes (10): BOOK_MAP, EMPTY_FORM, EMPTY_POINT, GuideForm, GuidePage(), parseBiblePassageUrl(), parseSermonText(), CellGuideDetail (+2 more)

### Community 63 - "suggestion.tsx"
Cohesion: 0.32
Nodes (6): Suggestion(), SuggestionProps, Suggestions(), SuggestionsProps, ScrollArea, ScrollBar

### Community 64 - "constants.ts"
Cohesion: 0.17
Nodes (11): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+3 more)

### Community 65 - "hospitality.ts"
Cohesion: 0.20
Nodes (9): Command, CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+1 more)

### Community 66 - "visits.ts"
Cohesion: 0.31
Nodes (8): GET(), GET(), countPendingVisits(), createVisitRequest(), getAcceptedVisitsAsSender(), getPendingVisitRequests(), respondVisitRequest(), VisitRequest

### Community 67 - "message.tsx"
Cohesion: 0.27
Nodes (8): Message(), MessageAvatar(), MessageAvatarProps, MessageContentProps, MessageProps, Avatar, AvatarFallback, AvatarImage

### Community 68 - "task.tsx"
Cohesion: 0.10
Nodes (16): SourceProps, Sources(), SourcesContent(), SourcesContentProps, SourcesProps, SourcesTriggerProps, Task(), TaskContent() (+8 more)

### Community 69 - "toolbar.tsx"
Cohesion: 0.17
Nodes (7): ArrowUpIcon(), StopIcon(), SummarizeIcon(), randomArr, Toolbar, ToolProps, TooltipContent

### Community 70 - "documents.ts"
Cohesion: 0.25
Nodes (6): ChapterData, FONT_SIZE_CLASS, FONT_SIZE_LABEL, FontSize, Highlight, Verse

### Community 71 - "page.tsx"
Cohesion: 0.22
Nodes (4): ConsentState, VISIBILITY_LABELS, VisibilityOption, VisibilityState

### Community 72 - "models.test.ts"
Cohesion: 0.25
Nodes (7): artifactModel, chatModel, mockUsage, reasoningModel, titleModel, getResponseChunksByPrompt(), mockUsage

### Community 73 - "schema.ts"
Cohesion: 0.25
Nodes (7): filePartSchema, messageSchema, partSchema, PostRequestBody, postRequestBodySchema, textPartSchema, userMessageSchema

### Community 74 - "page.tsx"
Cohesion: 0.39
Nodes (7): avatarSrc(), ChatPage(), Conversation, ConversationView(), ConvMessage, formatTime(), Partner

### Community 75 - "page.tsx"
Cohesion: 0.52
Nodes (5): GET(), POST(), getBusinessRecommendations(), toggleBusinessRecommendation(), BusinessRecommendation

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
Cohesion: 0.38
Nodes (5): ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, Separator

### Community 80 - "dialog.tsx"
Cohesion: 0.29
Nodes (6): DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay, DialogTitle

### Community 81 - "Suggestion"
Cohesion: 0.26
Nodes (10): PureSuggestedActions(), getArtifactModel(), requestSuggestions(), RequestSuggestionsProps, updateDocument(), UpdateDocumentProps, documentHandlersByArtifactKind, getDocumentById() (+2 more)

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

## Knowledge Gaps
- **635 isolated node(s):** `authFormSchema`, `registerFormSchema`, `next-auth`, `Session`, `User` (+630 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **101 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `lucide-react`, `motion`, `nanoid`, `diff.js`, `next`, `next-themes`, `@opentelemetry/api`, `orderedmap`, `papaparse`, `postgres`, `prosemirror-example-setup`, `prosemirror-markdown`, `prosemirror-model`, `prosemirror-schema-basic`, `prosemirror-schema-list`, `prosemirror-state`, `prosemirror-view`, `@radix-ui/react-collapsible`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-icons`, `@radix-ui/react-progress`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@radix-ui/react-tooltip`, `@radix-ui/react-use-controllable-state`, `@radix-ui/react-visually-hidden`, `button.tsx`, `react-data-grid`, `react-dom`, `react-leaflet`, `react-resizable-panels`, `react-syntax-highlighter`, `redis`, `resumable-stream`, `server-only`, `shiki`, `sonner`, `streamdown`, `swr`, `tailwind-merge`, `tailwindcss-animate`, `@types/leaflet`, `use-stick-to-bottom`, `usehooks-ts`, `@vercel/analytics`, `@vercel/blob`, `@vercel/otel`, `web-push`, `zod`, `zustand`, `class-variance-authority`, `package.json`, `ai`, `@ai-sdk/provider`, `@ai-sdk/react`, `page.tsx`, `bcrypt-ts`, `classnames`, `clsx`, `cmdk`, `codemirror`, `@codemirror/lang-python`, `@codemirror/state`, `@codemirror/theme-one-dark`, `@codemirror/view`, `date-fns`, `dotenv`, `drizzle-orm`, `embla-carousel-react`, `framer-motion`, `geist`, `@icons-pack/react-simple-icons`, `leaflet`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `react` connect `button.tsx` to `sidebar.tsx`, `dependencies`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Why does `useSidebar()` connect `button.tsx` to `chat.tsx`, `sidebar.tsx`, `artifact.tsx`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `User` (e.g. with `deleteUserAccount()` and `getAlerts()`) actually correct?**
  _`User` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 33 inferred relationships involving `deleteUserAccount()` (e.g. with `AlertResponse` and `BibleHighlight`) actually correct?**
  _`deleteUserAccount()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **What connects `authFormSchema`, `registerFormSchema`, `next-auth` to the rest of the system?**
  _635 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inline-citation.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._