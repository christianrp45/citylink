# Emetis — Planejamento e Estado do Projeto

**Versão:** 9.0
**Atualizado:** 2026-07-19
**Stack:** Next.js 16 + App Router + Drizzle ORM (Neon PostgreSQL) + NextAuth 5 + Vercel AI SDK v6 + Leaflet + Tailwind CSS 4 + SambaNova (Meta-Llama-3.3-70B)
**Deploy:** [app.emetis.com.br](https://app.emetis.com.br)
**Repositório:** [github.com/christianrp45/citylink](https://github.com/christianrp45/citylink)

---

## 1. Estado Atual — O que já está implementado e em produção

### Infraestrutura

| Item | Status |
|---|---|
| Banco Neon PostgreSQL conectado | ✅ |
| Drizzle ORM com migrações (0001–0025) | ✅ |
| NextAuth 5 com sessão real | ✅ |
| Vercel AI SDK v6 (useChat v3, DefaultChatTransport, sendMessage) | ✅ |
| Deploy Vercel automático via GitHub push | ✅ |
| Headers de segurança (X-Frame, CSP, etc.) | ✅ |
| OG/Twitter metadata em app/layout.tsx | ✅ |
| Error boundary (`app/(emetis)/error.tsx`) | ✅ |
| Loading state (`app/(emetis)/loading.tsx`) | ✅ |
| PWA manifest + ícones `icon-192.png` e `icon-512.png` | ✅ |

### Módulo Mapa / Uber Humano (Sistema de Visitas)

| Feature | Arquivo | Status |
|---|---|---|
| Mapa Leaflet real com usuários próximos | `map/page.tsx` | ✅ |
| Status Mesa Posta 🟢 / Requer Aviso 🟡 | `map/page.tsx`, `profile/page.tsx` | ✅ |
| Sistema de visitas (solicitar, aceitar, recusar, adiar) | `api/visits/` | ✅ |
| Alertas de proximidade (cron diário às 8h) | `api/cron/proximity/route.ts`, `vercel.json` | ✅ |
| Janelas de Hospitalidade (HospitalityWindow) | `api/hospitality/` | ✅ |
| Configuração de proximidade no Perfil | `profile/page.tsx`, `api/users/proximity-config/` | ✅ |
| Botão "Estou disponível agora" no Mapa | `map/page.tsx` | ✅ |
| Visibilidade configurável (quem me vê) | `api/users/visibility/` | ✅ |
| Círculos de Confiança (família = exato, amigos = bairro ~1km) | `api/users/nearby/`, `api/friends/[id]/circle/` | ✅ |
| Múltiplos pontos de localização (Casa, Trabalho, Igreja) | `api/users/locations/`, `profile/page.tsx` | ✅ |

### Módulo Vínculo — Igreja / Célula / Comunidade

| Feature | Arquivo | Status |
|---|---|---|
| Geração de código de convite (líder/admin) | `api/invite/generate/` | ✅ |
| Preview público do convite | `api/invite/[code]/` | ✅ |
| Uso do convite (vincula membro) | `api/invite/[code]/use/` | ✅ |
| Revogação de código | `api/invite/[code]/` DELETE | ✅ |
| Página pública `/join/[code]` com redirect para login | `join/[code]/page.tsx` | ✅ |
| Botão "Convidar" na página da Célula (líder/co-líder) | `mdc/cells/[cellId]/page.tsx` | ✅ |
| `primaryChurchId` no User (uma igreja por usuário) | migração 0022 | ✅ |

### Módulo MDC — Grupos Pequenos

| Feature | Arquivo | Status |
|---|---|---|
| Hub de grupos (`/mdc`) com abas: Minha Célula, Grupos, Oração, IA Pastoral | `mdc/page.tsx` | ✅ |
| Diretório de grupos (`/mdc/cells`) | `mdc/cells/page.tsx` | ✅ |
| Página do grupo com feed + reuniões | `mdc/cells/[cellId]/page.tsx` | ✅ |
| Renomear célula (líder) | `mdc/cells/[cellId]/page.tsx` | ✅ |
| Agendar reunião (líder) | `mdc/cells/[cellId]/meeting/new/page.tsx` | ✅ |
| Encerrar reunião (líder) | `api/mdc/meetings/[meetingId]/route.ts` | ✅ |
| RSVP de reunião | `api/mdc/meetings/[meetingId]/rsvp/` | ✅ |
| Lista de presença | `api/mdc/meetings/[meetingId]/attendance/` | ✅ |
| Pedidos de oração com "Orei por isso 🙏" | `mdc/cells/[cellId]/prayer/page.tsx` | ✅ |
| Roteiro padrão MDC batista (7 seções) | `mdc/cells/[cellId]/meeting/[meetingId]/guide/page.tsx` | ✅ |
| Geração de roteiro com IA (SambaNova — Meta-Llama-3.3-70B) | `api/mdc/ai/generate-guide/route.ts` | ✅ |
| Colar pregação completa → adapta para formato MDC | `guide/page.tsx` + API | ✅ |
| Link passagem bíblica → leitor bíblico | `guide/page.tsx` | ✅ |
| PDF do roteiro (gerado no cliente) | `guide/page.tsx` | ✅ |
| Notas privadas do líder (visível só ao líder) | `guide/page.tsx` + `api/mdc/meetings/[meetingId]/guide/` | ✅ |
| Seções exclusivas do líder ocultas para membros | `guide/page.tsx` | ✅ |
| Histórico de roteiros da célula | `mdc/cells/[cellId]/history/page.tsx` | ✅ |
| Cache offline do roteiro gerado | `guide/page.tsx` (localStorage) | ✅ |
| Push notification ao publicar roteiro | `api/mdc/meetings/[meetingId]/guide/` | ✅ |
| Ícone Emetis sempre visível + link para /map no roteiro | `guide/page.tsx` | ✅ |
| Assistente IA Pastoral (Teo) na aba de grupos | `mdc/page.tsx` | ✅ |

#### Formato do Roteiro MDC batista (7 seções implementadas)

1. **PARA O LÍDER** — reflexão sobre discipulado e formação
2. **QUEBRANDO O GELO** — nome temático + dinâmica
3. **EXALTAÇÃO** — músicas (links YouTube) + oração
4. **O QUE APRENDEMOS ESSA SEMANA?** — introdução + 3 pontos (título + ref bíblica + desenvolvimento + pergunta de discussão)
5. **CONCLUSÃO E CHECAGEM** — síntese + pergunta de aplicação + dica ao líder
6. **EVANGELISMO** — orientação crentes/não-crentes + história + desafio da semana

### Módulo Bíblia

| Feature | Arquivo | Status |
|---|---|---|
| Home da Bíblia com versículo do dia | `bible/page.tsx` | ✅ |
| Planos de leitura (Salmos 30, NT 90, Bíblia 1 Ano) | `bible/page.tsx` + `lib/reading-plans.ts` | ✅ |
| Progresso dos planos persistido no DB | `api/bible/plans/route.ts`, tabela ReadingPlanProgress | ✅ |
| Leitor de capítulo com navegação | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Highlights (destaques coloridos) por versículo | `api/bible/highlights/route.ts` | ✅ |
| Teo — Assistente Bíblico com contexto do capítulo | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Bottom sheet Teo (70dvh) com perguntas sugeridas | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Busca de livros na home | `bible/page.tsx` | ✅ |

### Módulo Comunidade

| Feature | Arquivo | Status |
|---|---|---|
| Feed de testemunhos com curtidas e comentários | `community/page.tsx` | ✅ |
| Alertas Samaritano (urgência, oração, ajuda) | `community/page.tsx` | ✅ |
| Comunidades com aprovação de membros | `api/communities/` | ✅ |
| Grupos de oração | `api/prayer-groups/` | ✅ |
| Voluntariado | `api/volunteer/` | ✅ |

### Módulo Perfil e Conta

| Feature | Arquivo | Status |
|---|---|---|
| Perfil completo com foto, bio, talentos | `profile/page.tsx` | ✅ |
| Status Mesa Posta / Requer Aviso / Offline | `profile/page.tsx` | ✅ |
| Visitas pendentes e confirmadas | `profile/page.tsx` | ✅ |
| Notificações push (subscribe/unsubscribe) | `profile/page.tsx`, `api/push/subscribe/` | ✅ |
| Círculos de Confiança (família/amigos) | `profile/page.tsx`, `api/friends/[id]/circle/` | ✅ |
| Meus Locais (casa, trabalho, igreja configuráveis) | `profile/page.tsx`, `api/users/locations/` | ✅ |
| Alertas de Proximidade (toggle, raio, cooldown, expiração) | `profile/page.tsx`, `api/users/proximity-config/` | ✅ |
| Configurações de privacidade | `api/users/privacy/` | ✅ |
| Exportar dados (LGPD) | `api/users/export/` | ✅ |
| Excluir conta | `api/users/delete-account/` | ✅ |
| Onboarding (consentimento LGPD) | `app/(onboarding)/onboarding/page.tsx` | ✅ |

### IA — Teo e Pastoral

| Feature | Arquivo | Status |
|---|---|---|
| `teoPrompt` — assistente bíblico com identidade Teo (θεός), sem emojis | `lib/ai/prompts.ts` | ✅ |
| `teoWithPassagePrompt(book, chapter)` — com contexto do capítulo | `lib/ai/prompts.ts` | ✅ |
| Rota `/api/teo` com rate limit 50 msg/dia | `api/teo/route.ts` | ✅ |
| Rota `/api/pastoral` com rate limit 30 msg/dia | `api/pastoral/route.ts` | ✅ |
| Rota `/api/mdc/ai/generate-guide` — gera roteiro MDC via SambaNova (Meta-Llama-3.3-70B) | `api/mdc/ai/generate-guide/route.ts` | ✅ |
| Modelo gratuito fallback — Google Gemini 2.0/2.5 Flash Lite via `@ai-sdk/google` | `lib/ai/providers.ts` | ✅ |
| Banco de quebra-gelos integrado ao gerador de roteiro (lib/data/quebra-gelos.ts) | `api/mdc/ai/generate-guide/route.ts` | ✅ |
| Nome da instituição parceira oculto do prompt de IA (não exposto aos usuários) | `api/mdc/ai/generate-guide/route.ts` | ✅ |

---

## 2. Banco de Dados — Migrações Aplicadas

| Migração | Conteúdo | Status |
|---|---|---|
| 0001–0015 | Schema base (User, Chat, Cell, Church, Community, Friendship, etc.) | ✅ aplicada |
| 0016 | BibleHighlight | ✅ aplicada |
| 0017 | UserPrivacySettings, ConsentLog, UserProximityConfig, UserVisibilityConfig | ✅ aplicada |
| 0018 | HospitalityWindow | ✅ aplicada |
| 0019 | communityId em Cell | ✅ aplicada |
| 0020 | ReadingPlanProgress | ✅ aplicada |
| 0021 | CellGuide formato MDC (sermonTitle, preacher, leaderNote, icebreakerTitle, studyPoints, conclusion, evangelism…) | ✅ aplicada |
| 0022 | InviteCode table + primaryChurchId no User | ✅ aplicada |
| 0023 | circle (family/friends) na tabela Friendship | ✅ aplicada |
| 0024 | UserLocation (id, userId, label, type, lat, lng, isActive) | ✅ aplicada |
| 0025 | BusinessRecommendation (communityId, userId, comment) — Irmão Indica Irmão | ✅ aplicada |

---

## 3. O que ainda falta implementar

### Prioridade MÉDIA

- [x] **Push notifications** — `lib/push.ts` com web-push + VAPID keys no Vercel; envio real em visitas, proximidade, hospitalidade e mensagens
- [x] **Irmão Indica Irmão** — toggle "Indicar" por usuário, lista de recomendadores com avatar/nome/profissão; API GET/POST `/api/communities/[id]/recommend` (migration 0025)
- [x] **Modo noturno + tamanho de fonte** no leitor bíblico — botão Aa no header, toggle dark mode, 3 tamanhos (P/M/G), persistido em localStorage

### Prioridade BAIXA (futuro)

- [ ] **Troca de Talentos** — ofertas de ajuda não-monetária entre membros
- [ ] **Gamificação** — badges por visitas, ajudas e oração
- [ ] **Missões automáticas** — "Dona Rosa não recebe visitas há 2 semanas"
- [ ] **Dashboard do Líder** — frequência, inativos, aniversariantes, relatório PDF
- [ ] **Versículo do dia compartilhável** como imagem (Vercel OG)
- [ ] **Botão "Convidar" nas páginas de Igreja e Comunidade** (já existe na Célula)

---

## 4. Padrões Técnicos Importantes

### AI SDK v6 — useChat no cliente

```typescript
// CORRETO (v3 API)
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: '/api/teo' }),
});
const [input, setInput] = useState('');

function submit(text: string) {
  sendMessage({ role: 'user', parts: [{ type: 'text', text: text.trim() }] });
  setInput('');
}
```

### AI SDK v6 — Route handler com streaming

```typescript
// CORRETO (v6 API)
const result = streamText({ model, messages: await convertToModelMessages(messages), system });
return createUIMessageStreamResponse({
  execute: (writer) => { writer.merge(result.toUIMessageStream()); },
});
```

### Next.js 16 com cacheComponents

- `cacheComponents: false` no `next.config.ts` (true é incompatível com ThemeProvider e auth)
- Usar `await connection()` do `next/server` em layouts que fazem fetch dinâmico
- NÃO usar `export const dynamic = 'force-dynamic'` (incompatível com cacheComponents)

### Deploy

- `vercel --prod` faz deploy manual (GitHub push pode triggar automaticamente)
- Migrações rodam automaticamente no build: `tsx lib/db/migrate && next build`
- Cron de proximidade: `0 8 * * *` (diário às 8h — limite do plano Hobby)

---

## 5. Arquivos Críticos de Referência

| Arquivo | Função |
|---|---|
| `lib/db/schema.ts` | Schema completo de todas as tabelas |
| `lib/db/queries.ts` | Queries principais: usuário, visitas, convites, localização, amizades |
| `lib/db/queries-cells.ts` | Queries de células, reuniões, guias, orações |
| `lib/ai/prompts.ts` | Prompts: Teo, teoWithPassage, pastoral, generateGuide |
| `lib/reading-plans.ts` | 3 planos de leitura estáticos (Salmos, NT90, Bíblia1Ano) |
| `components/emetis-bottom-nav.tsx` | Navegação inferior (5 abas) |
| `app/(emetis)/layout.tsx` | Layout raiz com auth + onboarding redirect |
| `next.config.ts` | Config Next.js com headers e cacheComponents |
| `vercel.json` | Build command + cron schedule |

---

## 6. Navegação Atual (Bottom Nav — 5 abas)

```
[🗺️ Mapa] [📖 Bíblia] [⛪ Igreja] [💬 Chat] [👤 Perfil]
                              ↳ /mdc (Grupos, Oração, Pastoral)
```

---

---

## 7. Decisões Arquiteturais Recentes

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2026-07-14 | Migrar gerador de roteiro para SambaNova (Meta-Llama-3.3-70B) | Gratuito, sem necessidade de cartão de crédito |
| 2026-07-14 | Ocultar nome da instituição parceira do prompt de IA | Evitar que usuários vejam nome de terceiro nas respostas geradas |
| 2026-07-19 | Rename: `(citylink)→(emetis)`, `pib→mdc`, `teos→teo` | Consolidar branding Emetis em toda a codebase |

Atualizado em 2026-07-19 — repositório: github.com/christianrp45/citylink
