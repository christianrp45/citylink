# Emetis — Planejamento e Estado do Projeto

**Versão:** 10.0
**Atualizado:** 2026-07-20
**Stack:** Next.js 16 + App Router + Drizzle ORM (Neon PostgreSQL) + NextAuth 5 + Vercel AI SDK v6 + Leaflet + Tailwind CSS 4 + SambaNova (Meta-Llama-3.3-70B)
**Deploy:** [app.emetis.com.br](https://app.emetis.com.br)
**Repositório:** [github.com/christianrp45/citylink](https://github.com/christianrp45/citylink)

---

## 1. Estado Atual — Tudo implementado e em produção

### Infraestrutura

| Item | Status |
|---|---|
| Banco Neon PostgreSQL conectado | ✅ |
| Drizzle ORM com migrações (0001–0028) | ✅ |
| NextAuth 5 com sessão real | ✅ |
| Vercel AI SDK v6 (useChat v3, DefaultChatTransport, sendMessage) | ✅ |
| Deploy Vercel automático via GitHub push | ✅ |
| Headers de segurança (X-Frame, CSP, etc.) | ✅ |
| OG/Twitter metadata em app/layout.tsx | ✅ |
| Error boundary (`app/(emetis)/error.tsx`) | ✅ |
| Loading state (`app/(emetis)/loading.tsx`) | ✅ |
| PWA manifest + ícones `icon-192.png` e `icon-512.png` | ✅ |
| Push Notifications (VAPID, service worker, subscribe/unsubscribe) | ✅ |

### Módulo Mapa / Uber Humano

| Feature | Arquivo | Status |
|---|---|---|
| Mapa Leaflet com usuários próximos (haversine) | `map/page.tsx` | ✅ |
| Status Mesa Posta / Requer Aviso / Offline | `map/page.tsx`, `profile/page.tsx` | ✅ |
| Botão "Estou disponível agora" → HospitalityWindow 3h | `map/page.tsx` | ✅ |
| Sistema de visitas (solicitar, aceitar, recusar, adiar) | `api/visits/` | ✅ |
| Alertas Samaritano (urgência, oração, ajuda) com marcadores coloridos | `map/page.tsx`, `api/alerts/` | ✅ |
| Alertas de proximidade (cron diário às 8h) | `api/cron/proximity/`, `vercel.json` | ✅ |
| Janelas de Hospitalidade com push para amigos | `api/hospitality/` | ✅ |
| Círculos de Confiança (família=exato, amigos=bairro ~1km) | `api/friends/[id]/circle/` | ✅ |
| Múltiplos pontos de localização (Casa, Trabalho, Igreja) | `api/users/locations/` | ✅ |
| Visibilidade configurável | `api/users/visibility/` | ✅ |
| Modal de boas-vindas (novo usuário) | `components/welcome-modal.tsx` | ✅ |
| Teo intro para novo usuário (chat automático) | `components/teo-new-user-sheet.tsx` | ✅ |

### Módulo Vínculo

| Feature | Arquivo | Status |
|---|---|---|
| Códigos de convite (gerar, usar, revogar) | `api/invite/` | ✅ |
| Página pública `/join/[code]` | `join/[code]/page.tsx` | ✅ |
| QR Code de conexão pessoal no Perfil | `profile/page.tsx` (`react-qr-code`) | ✅ |
| Página `/connect/[userId]` pós-scan | `connect/[userId]/page.tsx` | ✅ |
| `primaryChurchId` no User | migração 0022 | ✅ |

### Módulo MDC — Grupos Pequenos

| Feature | Arquivo | Status |
|---|---|---|
| Hub `/mdc` com abas: Grupos, Oração, Pastoral IA | `mdc/page.tsx` | ✅ |
| Diretório de grupos `/mdc/cells` | `mdc/cells/page.tsx` | ✅ |
| Página do grupo com feed + reuniões | `mdc/cells/[cellId]/page.tsx` | ✅ |
| Renomear célula (líder) | `mdc/cells/[cellId]/page.tsx` | ✅ |
| Agendar reunião | `mdc/cells/[cellId]/meeting/new/page.tsx` | ✅ |
| Encerrar reunião, RSVP, lista de presença | `api/mdc/meetings/` | ✅ |
| Pedidos de oração com "Orei por isso 🙏" | `mdc/cells/[cellId]/prayer/page.tsx` | ✅ |
| Roteiro MDC 7 seções com geração IA (SambaNova) | `api/mdc/ai/generate-guide/` | ✅ |
| PDF do roteiro (gerado no cliente) | `guide/page.tsx` | ✅ |
| Histórico de roteiros | `mdc/cells/[cellId]/history/page.tsx` | ✅ |
| Push ao publicar roteiro | `api/mdc/meetings/[meetingId]/guide/` | ✅ |
| **Dashboard do Líder** — presença histórica, inativos, pedidos de oração | `mdc/dashboard/page.tsx` | ✅ |

### Módulo Bíblia

| Feature | Arquivo | Status |
|---|---|---|
| Home com versículo do dia e planos de leitura | `bible/page.tsx` | ✅ |
| Planos: Salmos 30, NT 90, Bíblia 1 Ano | `lib/reading-plans.ts` | ✅ |
| Leitor de capítulo com highlights coloridos | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Modo noturno + tamanho de fonte (P/M/G) | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Teo Bíblico com contexto do capítulo (bottom sheet) | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Seleção de texto → barra flutuante "Perguntar ao Teo" | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Toque em versículo → opção "Perguntar ao Teo" | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| **Versículo compartilhável como imagem** (Canvas 1080×1080, 4 temas, Web Share API) | `components/share-verse-modal.tsx` | ✅ |

### Módulo Comunidade e Negócios

| Feature | Arquivo | Status |
|---|---|---|
| Feed de testemunhos com curtidas e comentários | `community/page.tsx` | ✅ |
| Alertas Samaritano | `community/page.tsx` | ✅ |
| Comunidades, grupos de oração, voluntariado | `api/communities/`, `api/prayer-groups/`, `api/volunteer/` | ✅ |
| Página de Negócios com "Irmão Indica Irmão" | `businesses/page.tsx` | ✅ |
| **Troca de Talentos** — oferecer e encontrar habilidades | `talents/page.tsx`, `api/talents/` | ✅ |

### Módulo Perfil e Conta

| Feature | Arquivo | Status |
|---|---|---|
| Foto, bio, status disponibilidade, profissão | `profile/page.tsx` | ✅ |
| Edição de nome, telefone, profissão | `api/users/me/` PATCH | ✅ |
| Visitas pendentes e confirmadas | `profile/page.tsx` | ✅ |
| Notificações push (subscribe/unsubscribe) | `profile/page.tsx` | ✅ |
| Círculos de Confiança | `profile/page.tsx` | ✅ |
| Meus Locais (CRUD + ativação) | `profile/page.tsx` | ✅ |
| Alertas de Proximidade (toggle, raio, cooldown) | `profile/page.tsx` | ✅ |
| QR Code pessoal de conexão | `profile/page.tsx` | ✅ |
| **Missões semanais e pontos** (10 missões, 5 níveis) | `profile/page.tsx`, `api/missions/` | ✅ |
| Configurações de privacidade, exportar dados, excluir conta | `api/users/` | ✅ |
| Onboarding (consentimento LGPD) | `app/(onboarding)/onboarding/page.tsx` | ✅ |

### IA — Teo e Pastoral

| Feature | Arquivo | Status |
|---|---|---|
| Teo FAB global — botão τ flutuante em todas as telas | `components/teo-fab.tsx` | ✅ |
| Teo bíblico com contexto do capítulo/versículo | `api/teo/route.ts`, `lib/ai/prompts.ts` | ✅ |
| Modo boas-vindas (novo usuário) | `components/teo-new-user-sheet.tsx` | ✅ |
| API Pastoral com rate limit 30 msg/dia | `api/pastoral/route.ts` | ✅ |
| Gerador de roteiro MDC (SambaNova Meta-Llama-3.3-70B) | `api/mdc/ai/generate-guide/route.ts` | ✅ |
| Banco de quebra-gelos integrado | `lib/data/quebra-gelos.ts` | ✅ |
| Nome da instituição parceira oculto dos prompts | `api/mdc/ai/generate-guide/route.ts` | ✅ |
| `teo:ask` CustomEvent — comunicação cross-component | `teo-fab.tsx` ↔ `bible/read` | ✅ |

---

## 2. Banco de Dados — Migrações

| Migração | Conteúdo |
|---|---|
| 0001–0015 | Schema base (User, Chat, Cell, Church, Community, Friendship, etc.) |
| 0016 | BibleHighlight |
| 0017 | UserPrivacySettings, ConsentLog, UserProximityConfig, UserVisibilityConfig |
| 0018 | HospitalityWindow |
| 0019 | communityId em Cell |
| 0020 | ReadingPlanProgress |
| 0021 | CellGuide formato MDC (7 seções) |
| 0022 | InviteCode + primaryChurchId no User |
| 0023 | circle (family/friends) na Friendship |
| 0024 | UserLocation |
| 0025 | BusinessRecommendation |
| 0026 | entryMode na Cell |
| 0027 | UserTalent (Troca de Talentos) |
| 0028 | UserPoints + UserMission (Gamificação) |

---

## 3. Gamificação — Missões e Níveis

### Missões semanais (10 total, resetam toda semana)

| Ação | Missão | Pontos | Hook |
|---|---|---|---|
| Presença em reunião | Participe de uma reunião de célula | 40 | `POST /api/mdc/meetings/.../attendance` |
| Highlight bíblico | Faça um destaque na Bíblia | 15 | `POST /api/bible/highlights` |
| Plano de leitura | Avance no plano de leitura | 25 | `POST /api/bible/plans` |
| Visita solicitada | Solicite uma visita a alguém | 30 | `POST /api/visits` |
| Visita aceita | Aceite um visitante | 50 | `POST /api/visits/respond` |
| Talento oferecido | Ofereça um talento na comunidade | 20 | `POST /api/talents` |
| Testemunho | Compartilhe um testemunho | 25 | `POST /api/testimonials` |
| Mensagem enviada | Envie uma mensagem de encorajamento | 10 | `POST /api/messages/[userId]` |
| Mesa Posta | Ative a Mesa Posta | 30 | `POST /api/hospitality` |
| Oração | Ore por alguém na célula | 20 | `POST /api/mdc/prayer/[id]/pray` |

### Níveis

| Nível | Pontos mínimos |
|---|---|
| 🌱 Semente | 0 |
| 🌿 Broto | 100 |
| 🌳 Árvore | 300 |
| 🍎 Fruto | 600 |
| ✨ Luz | 1000 |

---

## 4. Padrões Técnicos Importantes

### AI SDK v6 — useChat no cliente

```typescript
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: '/api/teo' }),
});

// Enviar com contexto dinâmico por mensagem:
sendMessage(
  { role: 'user', parts: [{ type: 'text', text }] },
  { body: { context: { bookName, chapter } } }
);
```

### AI SDK v6 — Route handler com streaming

```typescript
const result = streamText({ model, messages: await convertToModelMessages(messages), system });
return createUIMessageStreamResponse({
  execute: (writer) => { writer.merge(result.toUIMessageStream()); },
});
```

### Gamificação — fire-and-forget

```typescript
// Não bloqueia a resposta HTTP
void awardPoints(session.user.id, "attend_meeting");
```

### Comunicação cross-component — Teo

```typescript
// Disparar de qualquer lugar (ex: Bible reader)
window.dispatchEvent(new CustomEvent('teo:ask', { detail: { text: '[João 3:16] "..."' } }));

// TeoFAB escuta e abre automaticamente
window.addEventListener('teo:ask', onTeoRequest as EventListener);
```

### Next.js 16

- `cacheComponents: false` no `next.config.ts`
- `await connection()` em layouts com fetch dinâmico
- NÃO usar `export const dynamic = 'force-dynamic'`

### Deploy

- Push para `main` → Vercel deploy automático
- Migrações: `tsx lib/db/migrate && next build`
- Cron de proximidade: `0 8 * * *` (diário às 8h)
- Graphify: rodar `graphify update .` após modificar código

---

## 5. Arquivos Críticos de Referência

| Arquivo | Função |
|---|---|
| `lib/db/schema.ts` | Schema completo de todas as tabelas |
| `lib/db/queries.ts` | Barrel de queries (importar sempre daqui) |
| `lib/db/queries-cells.ts` | Queries de células, reuniões, guias, orações |
| `lib/ai/prompts.ts` | Prompts: teoPrompt, teoWithPassagePrompt, newUserTeoPrompt, pastoralPrompt |
| `lib/gamification.ts` | MISSIONS, awardPoints(), getUserMissionsProgress(), níveis |
| `lib/reading-plans.ts` | 3 planos de leitura estáticos |
| `components/teo-fab.tsx` | FAB global do Teo (ouve evento teo:ask) |
| `components/share-verse-modal.tsx` | Modal de compartilhamento de versículo (Canvas API) |
| `components/welcome-modal.tsx` | Modal de boas-vindas (novo usuário) |
| `components/teo-new-user-sheet.tsx` | Chat intro do Teo para novo usuário |
| `components/emetis-bottom-nav.tsx` | Navegação inferior (5 abas) |
| `app/(emetis)/layout.tsx` | Layout raiz com auth + TeoFAB |
| `next.config.ts` | Config Next.js com headers e cacheComponents |
| `vercel.json` | Build command + cron schedule |

---

## 6. Navegação (Bottom Nav — 5 abas)

```
[🗺️ Mapa] [📖 Bíblia] [⛪ MDC] [💬 Chat] [👤 Perfil]
                           ↳ /mdc (Grupos, Oração, Pastoral, Dashboard)
```

**Páginas adicionais acessíveis por navegação interna:**
- `/talents` — Troca de Talentos (link na página /community)
- `/mdc/dashboard` — Dashboard do Líder (card na página da célula, só para líderes)
- `/connect/[userId]` — Perfil público pós-scan de QR Code
- `/join/[code]` — Entrada via convite

---

## 7. Decisões Arquiteturais

| Data | Decisão | Motivo |
|---|---|---|
| 2026-07-14 | SambaNova (Meta-Llama-3.3-70B) para gerador de roteiro | Gratuito, sem cartão de crédito |
| 2026-07-14 | Ocultar nome da instituição parceira do prompt de IA | Evitar exposição de terceiros aos usuários |
| 2026-07-19 | Rename: `(citylink)→(emetis)`, `pib→mdc`, `teos→teo` | Consolidar branding Emetis |
| 2026-07-19 | Onboarding: localStorage flags sem migração de DB | Simplicidade — não requer dado persistido |
| 2026-07-19 | QR Code usa `userId` estável como parâmetro | Sem sistema de tokens — suficiente para o caso de uso |
| 2026-07-19 | Teo cross-component via CustomEvent `teo:ask` | Evita estado global complexo |
| 2026-07-20 | Gamificação com `awardPoints()` fire-and-forget | Zero impacto na latência dos handlers existentes |
| 2026-07-20 | Canvas API para imagem de versículo (client-side) | Sem dependências novas, funciona offline |
