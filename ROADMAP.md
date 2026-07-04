# CityLink — Roadmap de Implementação
**Atualizado em:** 2026-07-04  
**Deploy:** [citylink-rosy.vercel.app](https://citylink-rosy.vercel.app)  
**Repositório:** github.com/christianrp45/citylink  
**Stack:** Next.js 16 · App Router · Drizzle ORM · Neon PostgreSQL · NextAuth 5 · Vercel AI SDK · Leaflet · Tailwind CSS 4

---

## 1. Visão do Produto

O CityLink é um **"Uber Humano"** — um app de proximidade social para igrejas e comunidades cristãs. A ideia central: quando você está passando perto da casa de um amigo, vê isso no mapa e com um toque informa **"Estou passando na sua área!"**. Se ele estiver com **Mesa Posta** (portas abertas), você vai direto sem pedir autorização.

**Público-alvo:** membros de igrejas evangélicas, especialmente a PIB Curitiba.  
**Domínio futuro:** emetis.com.br

---

## 2. Estado Atual do App (julho 2026)

### 2.1 Páginas implementadas

| Rota | Aba | Dados | Situação |
|------|-----|-------|----------|
| `/map` | Mapa | Mock | UI pronta, geoloc real, usuários mock |
| `/community` | Amigos | Mock | UI pronta, sem banco |
| `/events` | Eventos | Mock | UI pronta, sem banco |
| `/chat` | Chat | Mock | UI pronta, sem banco |
| `/pib` | Igreja | Mock + Banco | Hub Igreja completo; Células usa banco real |
| `/pib/cells` | — | Banco real | CRUD células funciona |
| `/pib/cells/[id]` | — | Banco real | Detalhes, reuniões, RSVP |
| `/pib/cells/[id]/prayer` | — | Banco real | Pedidos de oração |
| `/pib/cells/[id]/meeting/new` | — | Banco real | Criar reunião |
| `/pib/cells/[id]/meeting/[id]/guide` | — | Banco real + IA | Roteiro gerado por IA |
| `/profile` | Perfil | Mock | UI pronta, sem banco |
| `/login` | — | Banco real | Funciona |
| `/register` | — | Banco real | Funciona (campos básicos) |

### 2.2 Backend implementado

| Recurso | Status | Detalhe |
|---------|--------|---------|
| Autenticação | ✅ Real | NextAuth 5, email/senha + guest, JWT + bcrypt |
| Banco de dados | ✅ Real | Neon PostgreSQL + Drizzle ORM |
| Upload de imagem | ✅ Real | Vercel Blob — `POST /api/files/upload` (5MB, JPEG/PNG) |
| Chat com IA | ✅ Real | Streaming SSE, histórico salvo no banco |
| Células (PIB) | ✅ Real | CRUD completo, reuniões, oração, roteiro IA |
| Chat entre membros | ❌ Mock | Sem persistência, só estado React |
| Usuários no mapa | ❌ Mock | Hardcoded em MOCK_USERS |
| Amizades | ❌ Mock | Sem tabela no banco |
| Solicitações de visita | ❌ Mock | Sem persistência |
| Eventos | ❌ Mock | Sem tabela no banco |
| Alertas Samaritanos | ❌ Mock | Sem tabela no banco |
| Notificações push | ❌ Não existe | A implementar |
| Localização em tempo real | ❌ Parcial | Só lê, não salva no banco |

### 2.3 Tabelas existentes no banco

```
User            — id, email, password
Chat            — histórico do chat IA
Message_v2      — mensagens do chat IA
Cell            — células (grupos pequenos)
CellMember      — membros das células
CellMeeting     — reuniões agendadas
CellGuide       — roteiro da reunião
CellAttendance  — presença e RSVP
PrayerRequest   — pedidos de oração
PrayerInteraction — "orei por isso"
Vote_v2         — votos no chat IA
Document        — documentos do editor IA
Suggestion      — sugestões do editor IA
```

### 2.4 Variáveis de ambiente necessárias (Vercel)

```env
AUTH_SECRET=          # obrigatório — chave JWT NextAuth
POSTGRES_URL=         # obrigatório — Neon database URL
AI_GATEWAY_API_KEY=   # obrigatório — Vercel AI Gateway
BLOB_READ_WRITE_TOKEN= # obrigatório — Vercel Blob (upload)
REDIS_URL=            # opcional  — stream resumable do chat IA
```

---

## 3. O que Falta para o App Funcionar de Verdade

### Fase 1 — Base (sem isso nada funciona) 🔴

**1.1 Expandir tabela de usuários**
- Adicionar campos: `name`, `phone`, `profession`, `avatar`, `bio`, `availabilityStatus`, `lat`, `lng`, `updatedAt`
- Criar e rodar migration com Drizzle
- Arquivo: `lib/db/schema.ts` + `pnpm db:migrate`

**1.2 Tela de Registro completa**
- Hoje pede só email e senha
- Adicionar: nome completo, telefone, profissão
- Salvar todos no banco

**1.3 Perfil real**
- Carregar dados do usuário logado via `session` do NextAuth
- Editar nome, profissão, bio, telefone e salvar no banco
- Upload de foto real usando a rota `/api/files/upload` que já existe
- Mesa Posta: salvar `availabilityStatus` no banco quando o usuário altera

**1.4 API de atualização de localização**
- `POST /api/users/location` → atualiza `lat/lng` do usuário logado
- Chamada automática quando o mapa abre (com permissão do usuário)

---

### Fase 2 — Mapa com pessoas reais 🔴

**2.1 API de usuários próximos**
```
GET /api/users/nearby?lat=-16.68&lng=-49.26&radius=2000
```
- Filtra usuários com `availabilityStatus != 'offline'` dentro do raio
- Retorna: id, name, avatar, profession, lat, lng, availabilityStatus

**2.2 Conectar mapa às pessoas reais**
- Substituir `MOCK_USERS` pela chamada à API acima
- Atualizar posição do usuário logado quando o mapa carrega

**2.3 Algoritmo de distância já existe**
- Função `haversine()` já implementada em `map/page.tsx`
- Só precisa mover para `lib/utils.ts` e reutilizar

---

### Fase 3 — Amigos e Visitas 🟠

**3.1 Tabela de amizades**
```typescript
// Adicionar em lib/db/schema.ts
Friendship: { userId, friendId, status: 'pending' | 'accepted', createdAt }
```

**3.2 APIs de amizade**
```
POST   /api/friends/request      — enviar pedido de amizade
POST   /api/friends/accept        — aceitar pedido
DELETE /api/friends/[userId]      — remover amigo
GET    /api/friends               — listar meus amigos
GET    /api/friends/discover      — sugerir pessoas próximas
```

**3.3 Solicitação de visita**
```typescript
// Adicionar em lib/db/schema.ts
VisitRequest: { id, fromUserId, toUserId, message, status: 'pending'|'accepted'|'declined', createdAt }
```
```
POST /api/visits/request          — solicitar visita
POST /api/visits/[id]/respond     — aceitar ou recusar
GET  /api/visits/pending          — visitas pendentes para mim
```

**3.4 Notificação simples (badge no sino)**
- Ao receber visita: incrementar contador no banco
- Header já tem o sino — conectar ao contador real

---

### Fase 4 — Chat entre membros 🟠

**4.1 Tabela de mensagens diretas**
```typescript
// Adicionar em lib/db/schema.ts
DirectMessage: { id, fromUserId, toUserId, content, createdAt, readAt }
```

**4.2 APIs de mensagens**
```
GET  /api/messages                 — listar conversas (última mensagem de cada)
GET  /api/messages/[userId]        — histórico com um usuário
POST /api/messages/[userId]        — enviar mensagem
POST /api/messages/[userId]/read   — marcar como lida
```

**4.3 Atualização em tempo real**
- **Opção A (simples, começa agora):** polling a cada 5 segundos
- **Opção B (melhor, depois):** SSE usando o mesmo padrão do chat IA (Redis + resumable-stream)

---

### Fase 5 — Eventos e Alertas reais 🟡

**5.1 Tabela de Eventos**
```typescript
Event: { id, title, description, type, address, lat, lng, date, organizerId, createdAt }
EventAttendee: { eventId, userId, joinedAt }
```
```
GET  /api/events             — listar eventos
POST /api/events             — criar evento
POST /api/events/[id]/join   — participar / cancelar
```

**5.2 Alertas Samaritanos**
```typescript
SamaritanAlert: { id, userId, type: 'urgency'|'prayer'|'practical_help', description, lat, lng, status: 'open'|'resolved', createdAt }
AlertResponse: { alertId, userId, createdAt }
```
```
GET  /api/alerts             — alertas próximos (filtrado por lat/lng)
POST /api/alerts             — criar alerta
POST /api/alerts/[id]/respond — "posso ajudar"
```

---

### Fase 6 — Notificações Push + PWA 🟡

**6.1 Web Push Notifications**
- Instalar: `web-push` (biblioteca Node.js padrão)
- Tabela: `PushSubscription` → salvar o token do dispositivo por usuário
- Disparar notificação quando: receber visita, receber mensagem, alerta próximo

**6.2 PWA — instalar no celular**
- Criar `public/manifest.json` com nome, ícones e cores do app
- Criar `public/sw.js` (service worker básico)
- Adicionar no `app/layout.tsx`: `<link rel="manifest" href="/manifest.json" />`
- Resultado: banner "Adicionar à tela inicial" no Android/Chrome

---

### Fase 7 — Igrejas e Comunidade completa 🟢

**7.1 Tabela de Igrejas**
```typescript
Church: { id, name, denomination, address, lat, lng, phone, schedule, pastor, members, adminUserId }
ChurchMember: { churchId, userId, role }
```

**7.2 Testemunhos no banco**
```typescript
Testimonial: { id, userId, title, content, createdAt }
TestimonialLike: { testimonialId, userId }
TestimonialComment: { id, testimonialId, userId, content, createdAt }
```

**7.3 Grupos de Oração (comunidade)**
```typescript
PrayerGroup: { id, name, description, schedule, topic, isOnline, creatorId }
PrayerGroupMember: { groupId, userId, joinedAt }
```

**7.4 Voluntariado**
```typescript
VolunteerOpportunity: { id, title, description, category, address, date, spots, organizerName, creatorId }
VolunteerEnrollment: { opportunityId, userId, enrolledAt }
```

---

## 4. Resumo Executivo de Prioridades

| Fase | O que entrega para o usuário | Esforço estimado |
|------|------------------------------|-----------------|
| **1 — Base** | Login com nome/foto, Mesa Posta salva de verdade | 2–3 dias |
| **2 — Mapa real** | Ver pessoas reais no mapa, posição atualizada | 1–2 dias |
| **3 — Amigos/Visitas** | Pedir amizade, solicitar visita, receber resposta | 3–4 dias |
| **4 — Chat** | Conversar com amigos (mensagens salvas) | 2–3 dias |
| **5 — Eventos/Alertas** | Eventos reais, alertas Samaritanos reais | 2–3 dias |
| **6 — Push + PWA** | Notificações no celular, instalar como app | 1–2 dias |
| **7 — Comunidade** | Igrejas, testemunhos, voluntariado no banco | 3–4 dias |

**Total estimado:** 14–21 dias de desenvolvimento contínuo

---

## 5. Ordem de Implementação Recomendada

```
[1] Expandir tabela User (migration)
    └── [1] Tela de registro com nome/telefone/profissão
        └── [1] Perfil real (carregar/salvar/foto)
            └── [1] Mesa Posta salva no banco
                └── [2] API /api/users/location (salvar lat/lng)
                    └── [2] API /api/users/nearby (buscar no raio)
                        └── [2] Mapa com usuários reais
                            └── [3] Tabela Friendship
                                └── [3] APIs de amizade
                                    └── [3] Tabela VisitRequest
                                        └── [3] Fluxo de visita real
                                            └── [4] Tabela DirectMessage
                                                └── [4] Chat com histórico
                                                    └── [5] Eventos reais
                                                        └── [5] Alertas reais
                                                            └── [6] Push + PWA
                                                                └── [7] Comunidade completa
```

---

## 6. Arquivos que Precisam ser Criados/Alterados por Fase

### Fase 1
```
lib/db/schema.ts              — adicionar campos em User
lib/db/migrations/            — nova migration
app/(auth)/register/page.tsx  — campos extras
app/(citylink)/profile/page.tsx — conectar ao banco
app/(chat)/api/users/me/route.ts — GET/PATCH perfil
```

### Fase 2
```
app/(chat)/api/users/nearby/route.ts   — GET usuários próximos
app/(chat)/api/users/location/route.ts — POST atualizar posição
app/(citylink)/map/page.tsx            — substituir MOCK_USERS pela API
```

### Fase 3
```
lib/db/schema.ts                         — tabelas Friendship e VisitRequest
app/(chat)/api/friends/route.ts
app/(chat)/api/friends/[userId]/route.ts
app/(chat)/api/visits/route.ts
app/(chat)/api/visits/[id]/respond/route.ts
app/(citylink)/community/page.tsx        — conectar ao banco
components/visit-request-modal.tsx       — conectar ao banco
```

### Fase 4
```
lib/db/schema.ts                              — tabela DirectMessage
app/(chat)/api/messages/route.ts
app/(chat)/api/messages/[userId]/route.ts
app/(citylink)/chat/page.tsx                  — conectar ao banco
```

### Fase 5
```
lib/db/schema.ts                          — tabelas Event e SamaritanAlert
app/(chat)/api/events/route.ts
app/(chat)/api/alerts/route.ts
app/(citylink)/events/page.tsx            — conectar ao banco
```

### Fase 6
```
public/manifest.json
public/sw.js
lib/db/schema.ts              — tabela PushSubscription
app/(chat)/api/push/route.ts  — salvar subscription
```

### Fase 7
```
lib/db/schema.ts              — tabelas Church, Testimonial, PrayerGroup, VolunteerOpportunity
app/(chat)/api/churches/
app/(chat)/api/testimonials/
app/(chat)/api/prayer-groups/
app/(chat)/api/volunteer/
app/(citylink)/pib/page.tsx   — conectar tabs ao banco
```

---

## 7. Comandos Úteis

```bash
# Rodar localmente
pnpm dev

# Gerar migration após alterar schema
pnpm db:generate

# Aplicar migrations no banco
pnpm db:migrate

# Ver banco visualmente (Drizzle Studio)
pnpm db:studio

# Build de produção
pnpm build

# Push para deploy no Vercel (branch main)
git push origin master:main
```

---

## 8. Recursos e Links

| Recurso | Link |
|---------|------|
| Deploy atual | citylink-rosy.vercel.app |
| Repositório | github.com/christianrp45/citylink |
| Banco (Neon) | console.neon.tech |
| Deploy (Vercel) | vercel.com/dashboard |
| Drizzle ORM | orm.drizzle.team |
| NextAuth 5 | authjs.dev |
| Leaflet | leafletjs.com |
| Vercel Blob | vercel.com/docs/vercel-blob |
| Vercel AI Gateway | vercel.com/docs/ai-gateway |

---

*Documento gerado em 2026-07-04. Atualizar conforme fases forem concluídas.*
