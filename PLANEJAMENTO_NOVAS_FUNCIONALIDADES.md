# CityLink — Planejamento de Novas Funcionalidades
**Versão:** 4.0 (próxima iteração)  
**Data:** 2026-07-02  
**Stack:** Next.js 16 + App Router + Drizzle ORM (Neon PostgreSQL) + NextAuth 5 + Vercel AI SDK + Leaflet + Tailwind CSS 4  
**Status:** Protótipo funcional com bugs — documento para continuidade em nova sessão

---

## 1. Estado Real do Protótipo (o que já existe)

### Features confirmadas no código

| Feature | Arquivo | Status |
|---|---|---|
| Status Mesa Posta 🟢 / Requer Aviso 🟡 | `map/page.tsx`, `profile/page.tsx` | ✅ Implementado |
| "Como Posso Ajudar" / Meus Talentos | `profile/page.tsx` | ✅ Implementado |
| FAB Botão Samaritano 🤝 + Modal | `community/page.tsx` | ✅ Implementado |
| 3 tipos de alerta: 🚨 Urgência / 🙏 Oração / 🤝 Ajuda | `community/page.tsx` | ✅ Implementado |
| Irmão Indica Irmão (`communityRecommendations[]`) | `lib/mockData.ts`, `lib/types.ts` | ✅ Modelado |
| Filtro Haversine 5km | `map/page.tsx` (função `getDistance`) | ✅ Implementado |
| Bottom Sheet Modals (`rounded-t-3xl`, slide-up) | `map/page.tsx`, `community/page.tsx` | ✅ Implementado |
| Cores Tailwind v4: indigo / emerald / amber | todos os pages | ✅ Implementado |
| Navegação inferior (`citylink-bottom-nav.tsx`) | 5 abas: Mapa/Comunidade/Negócios/Chat/Perfil | ✅ Implementado |
| Mock data com 5 usuários + 2 alertas + 3 empresas | `lib/mockData.ts` | ✅ Implementado |
| Store Zustand com ações | `lib/store.ts` | ✅ Implementado |
| Mapa Leaflet real | `map/page.tsx` | ❌ **PLACEHOLDER** (div dashed) |

---

## 2. Bugs Encontrados para Corrigir Antes de Avançar

### Bug 1 — `community/page.tsx` faltando `'use client'`

O arquivo usa `useState` (hook de cliente) mas não tem a diretiva no topo.  
Isso causa erro silencioso no Next.js App Router.

**Correção:** adicionar `'use client';` na linha 1 de `community/page.tsx`.

```typescript
// community/page.tsx — LINHA 1 (faltando)
'use client';

import { useState } from "react";
// ...
```

### Bug 2 — `community/page.tsx` usa `<BottomNav />` sem importar

Na linha 141 do `community/page.tsx` há `<BottomNav />` mas o import não existe no arquivo.

**Correção:** adicionar import no topo:

```typescript
import { BottomNav } from '@/components/citylink-bottom-nav';
```

### Bug 3 — Store Zustand com mutação direta (anti-pattern)

Em `map/page.tsx` e `community/page.tsx`, o estado é inicializado assim:

```typescript
// ERRADO — mutação direta do estado Zustand
if (store.users.length === 0) {
  store.users = mockUsers;  // ← isso não é reativo
}
```

**Correção:** criar ação `initializeStore()` no store e chamá-la com `useEffect`:

```typescript
// lib/store.ts — adicionar ação
initializeStore: () => set((state) => ({
  users: state.users.length === 0 ? mockUsers : state.users,
  businesses: state.businesses.length === 0 ? mockBusinesses : state.businesses,
  samaritanAlerts: state.samaritanAlerts.length === 0 ? mockSamaritanAlerts : state.samaritanAlerts,
  currentUser: state.currentUser ?? mockUsers[0],
})),

// Nos pages — usar useEffect
useEffect(() => {
  store.initializeStore();
}, []);
```

### Bug 4 — Mapa sem Leaflet real

`map/page.tsx` exibe um placeholder em vez do mapa interativo. A biblioteca `react-leaflet` está no `package.json` mas não está sendo usada nesta página.

**Correção:** implementar o mapa real (ver seção 4 abaixo).

---

## 3. O Conceito Central — "Uber Humano" (Sistema de Visitas)

> O CityLink não é sobre caronas de carro. É o sistema que permite que você, ao passar perto da casa/trabalho/igreja de um amigo, veja isso no mapa e com um clique informe: **"Estou na área, posso passar?"**

### Fluxo A — Mesa Posta (já modelado, falta UI completa)
```
1. Você está a 800m da casa do João
2. App notifica: "João (Mesa Posta) está próximo — 800m"  
3. Você toca em "Estou indo!" 
4. João recebe: "Carlos está a caminho!"
5. Você vê a rota no mapa
```

### Fluxo B — Requer Aviso (já modelado, falta UI completa)
```
1. App notifica: "Maria está próxima — 1.2km (requer aviso)"
2. Você toca em "Posso passar?" + mensagem opcional
3. Maria recebe Bottom Sheet: [Aceitar] [Recusar] [Depois de 30 min]
4. Se aceitar: você recebe confirmação + endereço exato
```

### Fluxo C — Janela de Hospitalidade (novo)
```
1. João ativou: "Churrasco hoje, 12h–18h — todos são bem-vindos! 🍖"
2. Amigos do círculo recebem notificação
3. No mapa: ícone de João pulsa com descrição da janela
4. Qualquer um pode ir direto (funciona como Mesa Posta temporária)
```

---

## 4. O Que Falta Implementar — Lista Priorizada

### Prioridade ALTA (corrigir antes de novas features)

- [ ] **Bug 1:** `'use client';` no topo de `community/page.tsx`
- [ ] **Bug 2:** import `BottomNav` em `community/page.tsx`
- [ ] **Bug 3:** refatorar inicialização do store com `useEffect` + `initializeStore()`
- [ ] **Bug 4:** integrar Leaflet real em `map/page.tsx` (substituir placeholder)

### Prioridade ALTA (completar o núcleo)

- [ ] **Solicitar Visita:** botão "Estou indo!" (Mesa Posta) e "Posso passar?" (Requer Aviso) funcionando nos cards de usuário do MapPage
- [ ] **Modal de Visita Recebida:** Bottom Sheet que aparece para quem recebe a solicitação (Aceitar / Recusar / Depois de 30 min)
- [ ] **Notificação de Resultado:** feedback visual para quem enviou (aceito / recusado)
- [ ] **Irmão Indica Irmão:** exibir os recomendadores no card de empresa em `businesses/page.tsx` (o campo `communityRecommendations` já existe nos dados, falta mostrar na UI)

### Prioridade MÉDIA (novas funcionalidades)

- [ ] **Janelas de Hospitalidade:** agendar disponibilidade com título e horário
- [ ] **Círculos de Confiança:** quem vê localização exata vs. só bairro
- [ ] **Múltiplos Pontos de Localização:** casa, trabalho, igreja com visibilidade configurável
- [ ] **Módulo Bíblia** (detalhes na seção 5)
- [ ] **PIB Curitiba — Células** (detalhes na seção 6)

### Prioridade BAIXA (futuro)

- [ ] **Troca de Talentos:** ofertas de ajuda não-monetária
- [ ] **Gamificação:** badges por visitas e ajudas realizadas
- [ ] **Missões Automáticas:** "Dona Rosa não recebe visitas há 2 semanas"

---

## 5. Módulo Bíblia (estilo YouVersion)

### Conceito

Leitura bíblica integrada com o diferencial de **IA pastoral** — qualquer versículo abre o chatbot com contexto automático.

### Funcionalidades

#### 5.1 Leitor Bíblico
- Navegação: Livro → Capítulo → Versículo
- Versões: NVI, ARC, ARA, NAA, NTLH
- Modo noturno + tamanho de fonte ajustável

#### 5.2 Versículo do Dia
- Card visual na home do app
- Compartilhável como imagem (Vercel OG: `next/og`)
- Compartilhar no feed da comunidade CityLink

#### 5.3 Planos de Leitura
- "Bíblia em 1 Ano", "NT em 90 dias", "Salmos em 30 dias"
- Progresso percentual por plano
- Lembrete diário (badge no app)

#### 5.4 Destaques e Notas
- Selecionar versículo → cor (amarelo, verde, rosa, azul)
- Nota privada por versículo
- Diário de notas: `/bible/notes`

#### 5.5 IA Integrada (diferencial vs. YouVersion)
- Botão "Perguntar à IA" em qualquer versículo
- Chatbot abre com o versículo como contexto automático
- Sugestões: "Explique este versículo", "Contexto histórico", "Gerar reflexão para a célula"

### Rota: `app/(chat)/bible/`

```
bible/
├── page.tsx              # Home: versículo do dia + planos ativos
├── layout.tsx
├── read/[book]/[chapter]/page.tsx    # Leitor de capítulo
├── plans/page.tsx        # Lista de planos
├── plans/[planId]/page.tsx           # Progresso do plano
├── notes/page.tsx        # Diário de destaques e notas
└── search/page.tsx       # Busca por palavra ou referência
```

### API Routes

```
api/bible/
├── verse/route.ts           # GET ?book=Jo&chapter=3&verse=16&version=NVI
├── chapter/route.ts         # GET capítulo completo
├── verse-of-day/route.ts    # GET (com cache Redis Upstash)
├── verse-image/route.ts     # GET imagem OG para compartilhamento
├── plans/route.ts           # GET lista de planos
├── progress/route.ts        # GET/POST progresso do usuário
└── highlights/route.ts      # GET/POST/DELETE destaques e notas
```

### Fonte de Dados

| Opção | Detalhes |
|---|---|
| `bible-api.com` | Gratuito, PT-BR, sem chave |
| `api.biblia.com` | Mais versões, chave gratuita |
| JSON no Vercel Blob | Auto-hospedado, zero latência, zero custo |

**Estratégia recomendada:** JSON estático no Vercel Blob + cache Redis (Upstash já configurado no projeto).

### Novas Tabelas Drizzle

```typescript
export const bibleHighlight = pgTable("BibleHighlight", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  book: varchar("book", { length: 50 }).notNull(),
  chapter: integer("chapter").notNull(),
  verse: integer("verse").notNull(),
  color: varchar("color", { enum: ["yellow", "green", "pink", "blue"] }).notNull(),
  note: text("note"),
  version: varchar("version", { length: 10 }).notNull().default("NVI"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const bibleReadingPlan = pgTable("BibleReadingPlan", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  totalDays: integer("totalDays").notNull(),
  readings: json("readings").notNull(), // { day: number, references: string[] }[]
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const bibleReadingProgress = pgTable("BibleReadingProgress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  planId: uuid("planId").notNull().references(() => bibleReadingPlan.id),
  currentDay: integer("currentDay").notNull().default(1),
  completedDays: json("completedDays").notNull().default([]), // number[]
  startedAt: timestamp("startedAt").notNull().defaultNow(),
  lastReadAt: timestamp("lastReadAt"),
});
```

### Novos Tipos TypeScript (adicionar em `lib/types.ts`)

```typescript
export type BibleVersion = "NVI" | "ARC" | "ARA" | "NAA" | "NTLH";
export type BibleHighlightColor = "yellow" | "green" | "pink" | "blue";

export type BibleReference = {
  book: string;       // "João"
  chapter: number;    // 3
  verse?: number;     // 16
  verseEnd?: number;  // 21 (intervalos: "João 3:16-21")
};

export type BibleVerse = {
  reference: BibleReference;
  text: string;
  version: BibleVersion;
};

export type BibleHighlight = {
  id: string;
  userId: string;
  reference: BibleReference;
  color: BibleHighlightColor;
  note?: string;
  version: BibleVersion;
  createdAt: string;
};

export type ReadingPlanDay = {
  day: number;
  references: string[]; // ["João 3", "Salmos 23"]
};

export type ReadingPlan = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  totalDays: number;
  readings: ReadingPlanDay[];
};

export type ReadingProgress = {
  planId: string;
  currentDay: number;
  completedDays: number[];
  percentComplete: number; // calculado: (completedDays.length / totalDays) * 100
  startedAt: string;
  lastReadAt?: string;
};
```

---

## 6. PIB Curitiba — Células e Grupos Pequenos

### Conceito

Módulo para gestão de células (grupos de 8–15 pessoas que se reúnem semanalmente) da Primeira Igreja Batista de Curitiba. O **roteiro de célula gerado com IA** é o diferencial principal.

### O Roteiro de Célula

```
Estrutura padrão (90 minutos):
├── 📖 Passagem bíblica base        → link para módulo Bíblia
├── 🎯 Tema / Título do encontro
├── 🎲 Quebra-gelo (10 min)         → dinâmica para descontrair
├── 📚 Estudo — 3-4 perguntas (50 min)
├── ✅ Aplicação — desafio da semana (10 min)
└── 🙏 Sugestão de encerramento em oração (10 min)
```

### Geração de Roteiro com IA

```typescript
// lib/ai/prompts.ts — adicionar

export const CELL_GUIDE_PROMPT = (passage: string, theme?: string) => `
Você é um assistente pastoral brasileiro.
Crie um roteiro de célula cristã baseado em: ${passage}
${theme ? `Tema: ${theme}` : ""}

Responda em JSON:
{
  "title": "string",
  "theme": "string",
  "icebreaker": "dinâmica de 5–10 min para descontrair o grupo",
  "studyQuestions": ["pergunta 1", "pergunta 2", "pergunta 3", "pergunta 4"],
  "application": "desafio prático e específico para a semana",
  "prayer": "sugestão de como encerrar em oração"
}

Linguagem: português brasileiro, tom acolhedor e prático.
Duração sugerida total: 90 minutos.
`;
```

### Funcionalidades

- **Diretório de Células:** filtros por bairro, dia, faixa etária (jovens/casais/adultos/3ª idade/misto)
- **Agendamento de Encontros:** calendário + RSVP (Vou / Não vou / Talvez)
- **Roteiro:** criação manual OU geração por IA baseada na passagem bíblica
- **Publicação:** membros recebem notificação quando roteiro é publicado
- **Lista de Presença:** líder marca durante o encontro
- **Pedidos de Oração:** internos à célula com botão "Orei por isso 🙏"
- **Dashboard do Líder:** frequência, membros inativos, aniversariantes, relatório PDF

### Rota: `app/(chat)/pib/`

```
pib/
├── page.tsx                           # Hub: minha célula + calendário
├── layout.tsx
├── cells/
│   ├── page.tsx                       # Diretório de células
│   └── [cellId]/
│       ├── page.tsx                   # Página da célula (feed + próximo encontro)
│       ├── meeting/
│       │   ├── new/page.tsx           # Agendar encontro (líder)
│       │   └── [meetingId]/
│       │       ├── page.tsx           # Detalhes + RSVP
│       │       └── guide/page.tsx     # Roteiro completo
│       ├── members/page.tsx           # Membros (visão do líder)
│       └── prayer/page.tsx            # Pedidos de oração
└── dashboard/page.tsx                 # Dashboard do líder
```

### API Routes

```
api/pib/
├── cells/route.ts                    # GET lista | POST criar
├── cells/[cellId]/route.ts           # GET | PATCH
├── cells/[cellId]/join/route.ts      # POST solicitar entrada
├── meetings/route.ts                 # GET | POST
├── meetings/[meetingId]/guide/route.ts       # GET roteiro | POST salvar
├── meetings/[meetingId]/attendance/route.ts  # POST marcar presença
├── meetings/[meetingId]/rsvp/route.ts        # POST confirmar presença
├── prayer/route.ts                   # GET | POST pedidos
├── prayer/[prayerId]/pray/route.ts   # POST "Orei por isso"
└── ai/generate-guide/route.ts        # POST gerar roteiro com IA
```

### Novas Tabelas Drizzle

```typescript
export const cell = pgTable("Cell", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  leaderId: uuid("leaderId").notNull().references(() => user.id),
  coLeaderId: uuid("coLeaderId").references(() => user.id),
  lat: text("lat"),
  lng: text("lng"),
  address: text("address"),
  neighborhood: varchar("neighborhood", { length: 100 }),
  meetingDay: integer("meetingDay"),        // 0=Dom, 1=Seg...
  meetingTime: varchar("meetingTime", { length: 5 }), // "19:30"
  targetAudience: varchar("targetAudience", {
    enum: ["jovens", "casais", "adultos", "terceira-idade", "misto"]
  }).notNull().default("misto"),
  maxMembers: integer("maxMembers").default(15),
  isOpen: boolean("isOpen").notNull().default(true),
  description: text("description"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const cellMember = pgTable("CellMember", {
  id: uuid("id").primaryKey().defaultRandom(),
  cellId: uuid("cellId").notNull().references(() => cell.id),
  userId: uuid("userId").notNull().references(() => user.id),
  role: varchar("role", {
    enum: ["leader", "co-leader", "member", "visitor"]
  }).notNull().default("member"),
  joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  isActive: boolean("isActive").notNull().default(true),
});

export const cellMeeting = pgTable("CellMeeting", {
  id: uuid("id").primaryKey().defaultRandom(),
  cellId: uuid("cellId").notNull().references(() => cell.id),
  scheduledAt: timestamp("scheduledAt").notNull(),
  lat: text("lat"),
  lng: text("lng"),
  address: text("address"),
  status: varchar("status", {
    enum: ["scheduled", "completed", "cancelled"]
  }).notNull().default("scheduled"),
  visitorCount: integer("visitorCount").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const cellGuide = pgTable("CellGuide", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meetingId").notNull().references(() => cellMeeting.id),
  title: text("title").notNull(),
  biblePassage: varchar("biblePassage", { length: 100 }),
  theme: text("theme"),
  icebreaker: text("icebreaker"),
  studyQuestions: json("studyQuestions"),    // string[]
  application: text("application"),
  prayer: text("prayer"),
  isPublished: boolean("isPublished").notNull().default(false),
  publishedAt: timestamp("publishedAt"),
  generatedByAI: boolean("generatedByAI").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const cellAttendance = pgTable("CellAttendance", {
  meetingId: uuid("meetingId").notNull().references(() => cellMeeting.id),
  userId: uuid("userId").notNull().references(() => user.id),
  rsvpStatus: varchar("rsvpStatus", {
    enum: ["going", "not-going", "maybe", "no-response"]
  }).notNull().default("no-response"),
  attended: boolean("attended"),
  needsRide: boolean("needsRide").default(false),
}, (table) => ({
  pk: primaryKey({ columns: [table.meetingId, table.userId] }),
}));

export const prayerRequest = pgTable("PrayerRequest", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull().references(() => user.id),
  cellId: uuid("cellId").references(() => cell.id),
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  prayerCount: integer("prayerCount").notNull().default(0),
  isAnswered: boolean("isAnswered").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const prayerInteraction = pgTable("PrayerInteraction", {
  prayerRequestId: uuid("prayerRequestId").notNull().references(() => prayerRequest.id),
  userId: uuid("userId").notNull().references(() => user.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.prayerRequestId, table.userId] }),
}));
```

### Novos Tipos TypeScript

```typescript
export type CellTargetAudience = "jovens" | "casais" | "adultos" | "terceira-idade" | "misto";
export type CellMemberRole = "leader" | "co-leader" | "member" | "visitor";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type RsvpStatus = "going" | "not-going" | "maybe" | "no-response";

export type Cell = {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  leaderAvatar?: string;
  lat?: number;
  lng?: number;
  address?: string;
  neighborhood?: string;
  meetingDay?: number;    // 0=Dom
  meetingTime?: string;   // "19:30"
  targetAudience: CellTargetAudience;
  maxMembers: number;
  currentMembers: number; // calculado
  isOpen: boolean;
  description?: string;
  createdAt: string;
};

export type CellMeeting = {
  id: string;
  cellId: string;
  scheduledAt: string;
  lat?: number;
  lng?: number;
  address?: string;
  status: MeetingStatus;
  visitorCount: number;
  guide?: CellGuide;
};

export type CellGuide = {
  id: string;
  meetingId: string;
  title: string;
  biblePassage?: string;     // "João 3:16-21"
  theme?: string;
  icebreaker?: string;
  studyQuestions?: string[]; // 3-4 perguntas
  application?: string;      // desafio da semana
  prayer?: string;
  isPublished: boolean;
  publishedAt?: string;
  generatedByAI: boolean;
  createdAt: string;
};

export type CellAttendance = {
  meetingId: string;
  userId: string;
  userName: string;
  rsvpStatus: RsvpStatus;
  attended?: boolean;
  needsRide: boolean;
};

export type PrayerRequest = {
  id: string;
  userId: string;
  userName: string; // "" se isAnonymous
  cellId?: string;
  content: string;
  isAnonymous: boolean;
  prayerCount: number;
  isAnswered: boolean;
  userHasPrayed?: boolean; // calculado para o usuário logado
  createdAt: string;
};
```

---

## 7. Como os 3 Módulos se Conectam

```
Bíblia ─────────────────────────────────────────────────┐
  Versículo do dia aparece na home                       │
  Passagem bíblica do roteiro abre no leitor             │
  IA do chat usa contexto bíblico                       │
                                                         ▼
PIB / Célula ──────────────────────────────────► Roteiro do Encontro
  RSVP inclui "Preciso de ajuda para chegar?"            │
                                                         │
Uber Humano (Mapa) ◄───────────────────────────────────┘
  Membros da célula são círculo de confiança no mapa
  Janela de Hospitalidade criada no dia do encontro
  Alertas Samaritano visíveis para membros da célula
```

---

## 8. Navegação (Atualizar `citylink-bottom-nav.tsx`)

Adicionar abas para Bíblia e PIB:

```typescript
// Atual (5 abas)
[Mapa] [Comunidade] [Negócios] [Chat] [Perfil]

// Proposto (7 abas ou 5 + sub-menus)
[Mapa] [Bíblia] [PIB] [Comunidade] [Negócios] [Chat] [Perfil]

// Alternativa (menos poluído):
[Mapa] [Igreja ▾] [Negócios] [Chat] [Perfil]
          ↳ Bíblia
          ↳ PIB / Células
          ↳ Comunidade
```

---

## 9. Ordem de Implementação Recomendada

### Fase 0 — Bugs (fazer ANTES de qualquer coisa nova)

1. Adicionar `'use client';` em `community/page.tsx`
2. Importar `BottomNav` em `community/page.tsx`
3. Refatorar inicialização do store com `useEffect` + `initializeStore()`
4. Implementar mapa Leaflet real em `map/page.tsx`

### Fase 1 — Completar o Núcleo (Uber Humano)

5. Botões "Estou indo!" e "Posso passar?" nos cards de usuário
6. Bottom Sheet de solicitação de visita recebida
7. Feedback de resultado (aceito/recusado)
8. Exibir recomendadores no card de empresa (Irmão Indica Irmão UI)
9. Janelas de Hospitalidade

### Fase 2 — PIB Curitiba

10. Diretório de células + CRUD básico
11. Agendamento de encontros + RSVP
12. Criação de roteiro manual
13. Geração de roteiro com IA
14. Publicação + notificação para membros
15. Lista de presença (líder)
16. Pedidos de oração

### Fase 3 — Módulo Bíblia

17. Integrar API bíblica + cache Redis
18. Versículo do dia na home
19. Leitor de capítulo com navegação
20. Destaques e notas
21. Planos de leitura
22. Botão "Perguntar à IA" no versículo

### Fase 4 — Integração Final

23. Versículo do roteiro abre no leitor bíblico
24. RSVP de célula gera alerta de ajuda/carona no mapa
25. Membros da célula = círculo de confiança automático

---

## 10. Estrutura de Arquivos Final

```
app/(chat)/
├── page.tsx          # Home/Chat AI
├── map/              # Uber Humano — Mapa de Visitas (existente, expandir)
├── community/        # Comunidade + Samaritano (existente, corrigir bugs)
├── businesses/       # Empresas (existente, completar UI Irmão Indica Irmão)
├── profile/          # Perfil (existente)
├── bible/            # ← NOVO: Módulo Bíblia
└── pib/              # ← NOVO: PIB Curitiba — Células

components/
├── citylink-bottom-nav.tsx   # Atualizar com novas abas
├── [existentes]
├── visit-request-modal.tsx   # ← NOVO: Bottom Sheet de visita
├── availability-window-card.tsx  # ← NOVO: Janela de Hospitalidade
├── bible-verse-card.tsx      # ← NOVO: Card de versículo
├── cell-guide-editor.tsx     # ← NOVO: Editor de roteiro
└── prayer-request-card.tsx   # ← NOVO: Card de pedido de oração

lib/
├── types.ts          # Adicionar tipos Bíblia + PIB (ver seções 5 e 6)
├── db/schema.ts      # Adicionar tabelas Bíblia + PIB (ver seções 5 e 6)
├── ai/prompts.ts     # Adicionar CELL_GUIDE_PROMPT
├── store.ts          # Adicionar initializeStore() + ações de visita
└── mockData.ts       # Manter para desenvolvimento local
```

---

## Referências Rápidas

| Recurso | Detalhe |
|---|---|
| API Bíblia | `https://bible-api.com/?passage=João+3:16&translation=nvi` |
| Vercel OG | `import { ImageResponse } from 'next/og'` |
| Leaflet SSR | `import dynamic from 'next/dynamic'` — importar sem SSR |
| Drizzle migrate | `npm run db:generate && npm run db:migrate` |
| Redis cache | Upstash já configurado no projeto — `REDIS_URL` no `.env` |

---

*Documento gerado em 2026-07-02 — para continuidade em nova sessão.*  
*Repositório: github.com/christianrp45/citylink*
