# CityLink — Documento Master
**Versão:** 2.0  
**Última atualização:** 2026-07-05  
**Status:** Em desenvolvimento ativo — deploy em produção em citylink-rosy.vercel.app

---

## 1. Missão e Visão

O CityLink não é mais um app de redes sociais. É uma plataforma de **reconexão física** entre cristãos, famílias, amigos e comunidades.

> "Perseveravam na doutrina dos apóstolos, na comunhão, no partir do pão e nas orações." — Atos 2:42

**Problema que resolve:** O isolamento social aprofundado pelo COVID esfriou os laços humanos presenciais — visitas, abraços, células, encontros espontâneos. O CityLink usa tecnologia como **meio**, não como fim, para que pessoas se encontrem fisicamente.

**Quem usa:**
- Membros de igrejas que querem saber quem da célula mora perto
- Famílias que querem se encontrar mais
- Grupos de amigos que querem avisos de proximidade
- Pastores e líderes que gerem comunidades
- Empresas cristãs que querem conectar colaboradores de fé

**Diferencial competitivo:** Nenhum app cristão no mercado possui alertas de proximidade física entre membros. Church Center, Realm, Faithlife, YouVersion — nenhum avisa "seu irmão de célula está a 300m de você agora". Esta é a janela do CityLink.

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Next.js | 16 (App Router) | Framework full-stack |
| TypeScript | 5.8 | Tipagem estática |
| Drizzle ORM | latest | ORM type-safe |
| Neon PostgreSQL | — | Banco de dados serverless |
| NextAuth | 5 (beta) | Autenticação |
| Vercel AI SDK | — | Chat com IA |
| Leaflet | — | Mapas interativos |
| Tailwind CSS | 4 | Estilização |
| web-push (VAPID) | — | Push notifications |
| pnpm | — | Package manager |

**Deploy:** Vercel  
**Repositório:** github.com/christianrp45/citylink  
**Domínio futuro:** emetis.com.br  
**Dir local:** d:/Citylink-main/Citylink-main

---

## 3. O que já foi implementado (Fases 1–7)

### ✅ Fase 1 — Perfil real de usuário
- Tabela `User` expandida: name, phone, profession, avatar, bio, availabilityStatus, lat, lng
- API GET/PATCH `/api/users/me`
- Tela de registro e perfil conectados ao banco real
- Status "Mesa Posta" / "Requer Aviso"

### ✅ Fase 2 — Mapa com usuários reais
- API POST `/api/users/location` — salva coordenadas
- API GET `/api/users/nearby` — filtro haversine por raio, exclui offline
- Mapa Leaflet conectado, centro padrão Curitiba
- Sem dados mock

### ✅ Fase 3 — Amizades e Visitas
- Tabelas `Friendship` + `VisitRequest` (migration 0011)
- APIs: `/api/friends`, `/api/friends/request`, `/api/friends/accept`, `/api/visits`, `/api/visits/respond`, `/api/visits/pending`
- Modal de visita com aceite automático (Mesa Posta)
- Badge de visitas pendentes com polling 30s

### ✅ Fase 4 — DirectMessage (planejada, verificar implementação)
- Chat entre membros via API

### ✅ Fase 5 — Eventos e Alertas Samaritanos
- API GET/POST `/api/events`, `/api/events/[id]/join`
- API GET/POST `/api/alerts`, `/api/alerts/[id]/respond`
- Tipos de alerta: Urgência, Oração, Ajuda
- Eventos com join/leave toggle

### ✅ Fase 6 — PWA e Push Notifications
- `public/manifest.json` — nome "CityLink", start_url "/map"
- `public/sw.js` — Service Worker (Network First, push handler)
- VAPID keys geradas e configuradas no Vercel
- Hook `use-push-notifications.ts`
- API `/api/push/subscribe` (GET/POST/DELETE)
- Push ao receber mensagem e pedido de visita

### ✅ Fase 7 — Funcionalidades da Comunidade Cristã
- **Igrejas** (a renomear para Instituições): GET/POST `/api/churches`
- **Grupos de Oração**: GET/POST `/api/prayer-groups`, toggle join
- **Testemunhos**: GET/POST, likes, comentários
- **Voluntariado**: GET/POST oportunidades, inscrição
- **Células**: roteiro manual (localStorage) + link para guia IA
- Tab Bíblia: versículos estáticos + navegação por livros

### ✅ Infraestrutura
- Deploy funcionando em citylink-rosy.vercel.app
- Todos endpoints retornam 200 com sessão guest
- manifest.json e sw.js acessíveis (PWA instalável)
- Canary watch executado: HEALTHY ✓

---

## 4. Modelo de Dados Aprovado — v2 (A IMPLEMENTAR)

### 4.1 Novas tabelas

```sql
-- Comunidades (substitui Church)
Community {
  id, name, slug, type (CHURCH|COMPANY|FAMILY|FRIENDS|NEIGHBORHOOD|OTHER),
  description, avatar, address, city, state, country,
  phone, website, isPublic, requireApproval,
  adminUserId FK→User, createdAt
}

-- Membros da Comunidade
CommunityMember {
  communityId FK→Community, userId FK→User,
  role (OWNER|ADMIN|MODERATOR|MEMBER),
  joinedAt, approvedAt,
  canPost, canInvite, canManageEvents,
  PK(communityId, userId)
}

-- Configurações de Privacidade (LGPD Central)
UserPrivacySettings {
  userId FK→User (unique),
  consentDataProcessing bool + timestamp,   -- obrigatório para usar o app
  consentLocation bool + timestamp,          -- opt-in para aparecer no mapa
  consentProximityAlerts bool + timestamp,   -- opt-in para alertas de proximidade
  consentVisitRequests bool + timestamp,     -- opt-in para receber visitas
  consentProfileVisible bool + timestamp,    -- opt-in para aparecer em buscas
  updatedAt
}

-- Controle granular de visibilidade
UserVisibilityConfig {
  userId FK→User (unique),
  locationVisibleTo   ENUM(NOBODY|FRIENDS|MY_COMMUNITY|ALL),
  visitRequestFrom    ENUM(NOBODY|FRIENDS|MY_COMMUNITY|ALL),
  chatFrom            ENUM(NOBODY|FRIENDS|MY_COMMUNITY|ALL),
  profileVisibleTo    ENUM(NOBODY|FRIENDS|MY_COMMUNITY|ALL),
  updatedAt
}

-- Configuração do módulo de proximidade
UserProximityConfig {
  userId FK→User (unique),
  isActive bool,
  radiusMeters ENUM(100|300|500|1000|5000),
  activeWhen ENUM(SAME_CITY|SAME_STATE|SAME_COUNTRY|ALWAYS|NEVER),
  locationExpiresHours int,  -- LGPD: dado mínimo (1h, 6h, 24h, 72h)
  lastLocationAt timestamp,
  notifyWhenFriendNear bool,
  notifyWhenCellMemberNear bool,
  notifyWhenCommunityNear bool,
  cooldownMinutes int,  -- evita spam (ex: 60min entre alertas do mesmo par)
  updatedAt
}

-- Alertas de proximidade gerados
ProximityAlert {
  id, userId FK→User,  -- quem recebe
  nearUserId FK→User,  -- quem está perto
  distanceMeters int,
  relationContext ENUM(FRIEND|CELL_MEMBER|COMMUNITY_MEMBER),
  sentAt, expiresAt   -- LGPD: TTL automático
}

-- Log de auditoria LGPD (INSERT ONLY — imutável)
ConsentLog {
  id, userId FK→User,
  module ENUM(DATA_PROCESSING|LOCATION|PROXIMITY|VISIT_REQUESTS|PROFILE|CHAT),
  action ENUM(GRANTED|REVOKED),
  ipAddress text (anonimizado),
  userAgent text,
  createdAt
}
```

### 4.2 Tabelas existentes a alterar
```sql
-- User: adicionar campo
ALTER TABLE User ADD COLUMN accountType ENUM('individual', 'institution') DEFAULT 'individual';

-- Church → Community: migrar dados preservando registros existentes
```

---

## 5. Roadmap Completo — Próximos Passos

### 🔴 ETAPA 8 — Arquitetura de Comunidades e LGPD
**Pré-requisito para tudo que vem depois.**

- [ ] **8.1** Gerar migrations Drizzle para as 6 novas tabelas
- [ ] **8.2** Criar queries Drizzle para Community e CommunityMember
- [ ] **8.3** Criar queries para UserPrivacySettings, UserVisibilityConfig, UserProximityConfig
- [ ] **8.4** Criar queries para ConsentLog (insert-only, sem update)
- [ ] **8.5** API REST completa:
  - GET/POST `/api/communities`
  - GET/PATCH/DELETE `/api/communities/[id]`
  - POST `/api/communities/[id]/join`
  - GET/PATCH `/api/users/privacy`
  - GET/PATCH `/api/users/visibility`
  - GET/PATCH `/api/users/proximity-config`
- [ ] **8.6** Migrar dados de `Church` → `Community` (type: CHURCH)
- [ ] **8.7** Remover tabela `Church` após migração validada
- [ ] **8.8** Alterar `User.accountType` — campo individual/institution

### 🔴 ETAPA 9 — Onboarding LGPD
**Sem isso o app não pode crescer legalmente.**

- [ ] **9.1** Tela 1: Termos de Uso e Política de Privacidade (scroll + aceite obrigatório)
- [ ] **9.2** Tela 2: Módulos opcionais com consentimento individual:
  - Localização (aparecer no mapa)
  - Alertas de proximidade
  - Receber pedidos de visita
- [ ] **9.3** Tela 3: Configuração de visibilidade granular (quem me vê)
- [ ] **9.4** Registro no ConsentLog a cada grant/revoke
- [ ] **9.5** Página de Privacidade no perfil (alterar consentimentos a qualquer hora)
- [ ] **9.6** Exportar meus dados (LGPD art. 18) — endpoint `/api/users/export`
- [ ] **9.7** Deletar minha conta + todos os dados (LGPD art. 18)

### 🔴 ETAPA 10 — Renomeações e UI de Comunidades
- [ ] **10.1** Renomear "Igreja" → "Instituição" em toda a UI
- [ ] **10.2** Tela de listagem de comunidades (busca por tipo, cidade)
- [ ] **10.3** Tela de criação de comunidade (individual ou institucional)
- [ ] **10.4** Tela de gestão da comunidade (para admin/owner)
- [ ] **10.5** Aprovação de novos membros (se requireApproval = true)
- [ ] **10.6** Perfil da comunidade (membros, eventos, células)

### 🟠 ETAPA 11 — Módulo de Proximidade
**O diferencial competitivo do CityLink.**

- [ ] **11.1** Job de verificação de proximidade (Vercel Cron, a cada 5min)
  - Para usuários com proximidade ativa e localização recente (< expiresHours)
  - Calcular distância entre pares conectados (amigos + mesma comunidade)
  - Verificar cooldown para evitar spam
  - Disparar push notification se abaixo do raio configurado
- [ ] **11.2** Push notification de proximidade:
  - "João Silva está a 280m de você agora! 📍"
  - Com link para abrir o chat ou pedir visita
- [ ] **11.3** Respeitar `activeWhen`: comparar cidade/estado/país do usuário
- [ ] **11.4** Tela de configuração do módulo de proximidade no perfil:
  - Toggle ligar/desligar
  - Raio (100m, 300m, 500m, 1km, 5km)
  - Contexto geográfico (mesma cidade / estado / país / sempre)
  - Expiração de localização
  - Quem me notifica (amigos / minha célula / minha comunidade)
- [ ] **11.5** Botão "Estou disponível agora" no mapa
  - Ativa estado temporário (2h) com raio configurável
  - Notifica amigos próximos imediatamente

### 🟠 ETAPA 12 — Conteúdo Bíblico Real
**Substituir os textos estáticos simulados por Bíblia real.**

- [ ] **12.1** Baixar JSON `thiagobodruk/biblia` (ARC + NVI) e adicionar em `public/data/`
- [ ] **12.2** Criar helper `lib/bible.ts` com funções:
  - `getVerse(book, chapter, verse)`
  - `getChapter(book, chapter)`
  - `searchVerses(query)`
  - `getDailyVerse()` — rotação baseada no dia do ano
- [ ] **12.3** Substituir tab Bíblia atual por leitura real de capítulos
- [ ] **12.4** Busca de versículos por palavra-chave
- [ ] **12.5** Versículo do dia real (não lista estática)
- [ ] **12.6** Plano de leitura compartilhado por comunidade:
  - Admin define trecho da semana
  - Membros acompanham progresso
  - Notificação diária do trecho
- [ ] **12.7** Versículo contextual pós-check-in de célula

### 🟠 ETAPA 13 — Check-in de Célula por Geofence
- [ ] **13.1** Célula define endereço com lat/lng
- [ ] **13.2** Quando membro chega a 50m do endereço, app oferece check-in
- [ ] **13.3** Check-in registra presença + dispara versículo do roteiro
- [ ] **13.4** Líder vê lista de presentes em tempo real
- [ ] **13.5** Histórico de frequência por membro

### 🟡 ETAPA 14 — DirectMessage entre Membros
*(verificar se já foi implementado na Fase 4)*

- [ ] **14.1** Confirmar estado atual da implementação
- [ ] **14.2** Conversa 1:1 entre usuários conectados
- [ ] **14.3** Respeitar `UserVisibilityConfig.chatFrom`
- [ ] **14.4** Push notification ao receber mensagem (já tem infraestrutura)
- [ ] **14.5** Indicador de "online agora" (respeitar privacidade)

### 🟡 ETAPA 15 — Qualidade e Produção

- [ ] **15.1** `/production-audit` — auditoria completa de produção
- [ ] **15.2** `/security-review` — revisar endpoints de localização e auth
- [ ] **15.3** Índice espacial no PostgreSQL para queries haversine
  ```sql
  CREATE INDEX idx_user_location ON "User" USING gist (point(lng, lat));
  ```
- [ ] **15.4** Rate limiting nos endpoints de localização e alertas
- [ ] **15.5** `/accessibility` — revisão para usuários 50+ (Igreja tem todos os perfis)
- [ ] **15.6** `/seo` — meta tags, sitemap, Open Graph para descoberta
- [ ] **15.7** `/react-performance` — otimizar mapa e listas longas
- [ ] **15.8** `/e2e-testing` — fluxo completo: cadastro → mapa → visita → célula

### 🟡 ETAPA 16 — Design e Experiência
- [ ] **16.1** `/make-interfaces-feel-better` — UI mais acolhedora (calor humano)
- [ ] **16.2** `/frontend-design-direction` — identidade visual do CityLink
- [ ] **16.3** `/motion-patterns` — micro-animações com significado (ex: celebração ao aceitar visita)
- [ ] **16.4** Onboarding visual para novos usuários (o que fazer primeiro)
- [ ] **16.5** Tela de boas-vindas com missão do app

### 🟢 ETAPA 17 — Crescimento
- [ ] **17.1** Sistema de convites por comunidade (link único)
- [ ] **17.2** Página pública da comunidade (para não-membros)
- [ ] **17.3** QR Code de entrada na célula
- [ ] **17.4** Compartilhamento de testemunho em redes sociais
- [ ] **17.5** Dashboard do líder/pastor com métricas de conexão

---

## 6. APIs Externas Aprovadas

### Bíblia — Estratégia Híbrida
| Camada | Fonte | Uso |
|---|---|---|
| Dados embarcados | `github.com/thiagobodruk/biblia` (ARC + NVI JSON) | Leitura offline, zero custo |
| API de busca | `getbible.net` (sem autenticação) | Buscas dinâmicas |

### Apps Concorrentes Analisados
| App | Principal deficiência | O que aprender |
|---|---|---|
| Church Center | Sem proximidade entre membros | Check-in de presença |
| Realm | Sem alertas de proximidade | Diretório de membros com mapa |
| Faithlife/Logos | Sem geolocalização | Conteúdo bíblico profundo |
| YouVersion | Sem gestão de comunidade local | Hábito devocional diário |
| Band | Sem fe/proximidade | UX simples para grupos pequenos |
| Nearbyy | Sem contexto de fé | Alerta de proximidade (secular) |

**Conclusão:** Nenhum app combina alertas de proximidade + comunidade cristã + gestão de células. Esta é a janela única do CityLink.

---

## 7. Conformidade LGPD

### Dados coletados e finalidade declarada
| Dado | Finalidade | Base legal | TTL |
|---|---|---|---|
| Email | Autenticação | Contrato | Conta ativa |
| Nome, foto, bio | Identificação na comunidade | Consentimento | Conta ativa |
| Localização (lat/lng) | Mostrar no mapa, alertas proximidade | Consentimento | Configurável (1h–72h) |
| Histórico de localização | Não armazenamos — apenas última posição | — | Sobrescrito |
| Pedidos de visita | Registro de encontros | Consentimento | 90 dias |
| Push token | Notificações | Consentimento | Revogável |
| IP (ConsentLog) | Auditoria LGPD | Obrigação legal | 5 anos |

### Direitos do titular (LGPD art. 18)
- [ ] Acessar meus dados → `/api/users/export`
- [ ] Corrigir dados → tela de perfil
- [ ] Revogar consentimentos → tela de privacidade
- [ ] Deletar conta → exclusão completa
- [ ] Portabilidade → export JSON

### Encarregado (DPO)
A definir pelo responsável do projeto antes do lançamento público.

---

## 8. Variáveis de Ambiente (Vercel)

| Variável | Descrição |
|---|---|
| `AUTH_SECRET` | Segredo do NextAuth |
| `POSTGRES_URL` | Conexão Neon PostgreSQL |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (avatares) |
| `REDIS_URL` | Cache Redis |
| `VAPID_PUBLIC_KEY` | Web Push (chave pública) |
| `VAPID_PRIVATE_KEY` | Web Push (chave privada) |
| `VAPID_SUBJECT` | `mailto:admin@emetis.com.br` |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway |

---

## 9. Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Desenvolvimento local
pnpm dev

# Gerar migration após alterar schema
pnpm db:generate

# Aplicar migrations
pnpm db:migrate

# Verificar tipos
pnpm tsc --noEmit

# Deploy (push para Vercel via git)
git push origin master:main

# Gerar chaves VAPID (executar uma vez)
node -e "const wp=require('web-push');const k=wp.generateVAPIDKeys();console.log(JSON.stringify(k))"
```

---

## 10. Decisões Arquiteturais Registradas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-07-02 | Migrar de Vite/React para Next.js 16 App Router | SSR, API routes integradas, Vercel deploy nativo |
| 2026-07-04 | Usar Drizzle ORM + Neon PostgreSQL | Type-safety, serverless, custo zero |
| 2026-07-04 | Usar NextAuth 5 com guest auto-session | Usuários exploram o app sem cadastro obrigatório |
| 2026-07-04 | VAPID com emetis.com.br como subject | Domínio real do proprietário |
| 2026-07-05 | Bíblia embarcada (JSON) + getbible.net | Zero custo, zero dependência, funciona offline |
| 2026-07-05 | Community substitui Church | Escopo maior: igreja, empresa, família, amigos |
| 2026-07-05 | ConsentLog como tabela insert-only | Auditoria LGPD imutável |
| 2026-07-05 | Localização com TTL configurável | Dado mínimo necessário (LGPD art. 6) |
| 2026-07-05 | Cooldown de alerta de proximidade | Evitar comportamento Zenly (assédio por proximidade) |

---

*Documento gerado em 2026-07-05. Atualizar a cada fase concluída.*
