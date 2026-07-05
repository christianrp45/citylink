# CityLink — Planejamento e Estado do Projeto
**Versão:** 5.0  
**Atualizado:** 2026-07-05  
**Stack:** Next.js 16 + App Router + Drizzle ORM (Neon PostgreSQL) + NextAuth 5 + Vercel AI SDK v6 + Leaflet + Tailwind CSS 4  
**Deploy:** https://citylink-rosy.vercel.app  
**Repositório:** https://github.com/christianrp45/citylink  

---

## 1. Estado Atual — O que já está implementado e em produção

### Infraestrutura
| Item | Status |
|---|---|
| Banco Neon PostgreSQL conectado | ✅ |
| Drizzle ORM com migrações (0001–0021) | ✅ |
| NextAuth 5 com sessão real | ✅ |
| Vercel AI SDK v6 (useChat v3, DefaultChatTransport, sendMessage) | ✅ |
| Deploy Vercel automático via GitHub push | ✅ |
| Headers de segurança (X-Frame, CSP, etc.) | ✅ |
| OG/Twitter metadata em app/layout.tsx | ✅ |
| Error boundary (`app/(citylink)/error.tsx`) | ✅ |
| Loading state (`app/(citylink)/loading.tsx`) | ✅ |
| PWA manifest (faltam ícones icon-192.png e icon-512.png) | ⚠️ parcial |

### Módulo Mapa / Uber Humano (Sistema de Visitas)
| Feature | Arquivo | Status |
|---|---|---|
| Mapa Leaflet real com usuários próximos | `map/page.tsx` | ✅ |
| Status Mesa Posta 🟢 / Requer Aviso 🟡 | `map/page.tsx`, `profile/page.tsx` | ✅ |
| Sistema de visitas (solicitar, aceitar, recusar) | `api/visits/` | ✅ |
| Alertas de proximidade (cron diário às 8h) | `api/cron/proximity/route.ts`, `vercel.json` | ✅ |
| Janelas de Hospitalidade (HospitalityWindow) | `api/hospitality/` | ✅ DB + API |
| Configuração de proximidade no Perfil | `profile/page.tsx`, `api/users/proximity-config/` | ⚠️ em andamento |
| Botão "Estou disponível agora" no Mapa | pendente | ❌ |
| Visibilidade configurável (quem me vê) | `api/users/visibility/` | ✅ API |

### Módulo PIB Curitiba — Grupos Pequenos
| Feature | Arquivo | Status |
|---|---|---|
| Hub de grupos (`/pib`) com abas: Minha Célula, Grupos, Oração, IA Pastoral | `pib/page.tsx` | ✅ |
| Diretório de grupos (`/pib/cells`) | `pib/cells/page.tsx` | ✅ |
| Página do grupo com feed + reuniões | `pib/cells/[cellId]/page.tsx` | ✅ |
| Agendar reunião (líder) | `pib/cells/[cellId]/meeting/new/page.tsx` | ✅ |
| RSVP de reunião | `api/pib/meetings/[meetingId]/rsvp/` | ✅ |
| Lista de presença | `api/pib/meetings/[meetingId]/attendance/` | ✅ |
| Pedidos de oração com "Orei por isso 🙏" | `pib/cells/[cellId]/prayer/page.tsx` | ✅ |
| **Roteiro no padrão PIB Curitiba (7 seções)** | `guide/page.tsx` | ✅ |
| Geração de roteiro com IA (padrão PIB) | `api/pib/ai/generate-guide/route.ts` | ✅ |
| Colar pregação completa → adapta para formato PIB | `guide/page.tsx` + API | ✅ |
| Link passagem bíblica → leitor bíblico | `guide/page.tsx` | ✅ |
| Assistente IA Pastoral (Teos) na aba de grupos | `pib/page.tsx` | ✅ |

#### Formato do Roteiro PIB Curitiba (7 seções implementadas):
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
| **Teos — Assistente Bíblico** com contexto do capítulo | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Bottom sheet Teos (70dvh) com perguntas sugeridas | `bible/read/[book]/[chapter]/page.tsx` | ✅ |
| Busca de livros na home | `bible/page.tsx` | ✅ |

### Módulo Comunidade
| Feature | Arquivo | Status |
|---|---|---|
| Feed de testemunhos com curtidas e comentários | `community/page.tsx` | ✅ |
| Alertas Samaritano (urgência, oração, ajuda) | `community/page.tsx` | ✅ |
| Comunidades com aprovação de membros | `api/communities/` | ✅ API |
| Grupos de oração | `api/prayer-groups/` | ✅ API |
| Voluntariado | `api/volunteer/` | ✅ API |

### Módulo Perfil e Conta
| Feature | Arquivo | Status |
|---|---|---|
| Perfil completo com foto, bio, talentos | `profile/page.tsx` | ✅ |
| Configurações de privacidade | `api/users/privacy/` | ✅ |
| Exportar dados (LGPD) | `api/users/export/` | ✅ |
| Excluir conta | `api/users/delete-account/` | ✅ |
| Onboarding (consentimento LGPD) | `app/(onboarding)/onboarding/page.tsx` | ✅ |

### IA — Teos e Pastoral
| Feature | Arquivo | Status |
|---|---|---|
| `teosPrompt` — assistente bíblico com identidade Teos (θεός) | `lib/ai/prompts.ts` | ✅ |
| `teosWithPassagePrompt(book, chapter)` — com contexto do capítulo | `lib/ai/prompts.ts` | ✅ |
| Rota `/api/teos` com rate limit 50 msg/dia | `api/teos/route.ts` | ✅ |
| Rota `/api/pastoral` com rate limit 30 msg/dia | `api/pastoral/route.ts` | ✅ |
| Rota `/api/pib/ai/generate-guide` — gera roteiro PIB | `api/pib/ai/generate-guide/route.ts` | ✅ |

---

## 2. Banco de Dados — Migrações Aplicadas

| Migração | Conteúdo | Status |
|---|---|---|
| 0001–0015 | Schema base (User, Chat, Cell, etc.) | ✅ aplicada |
| 0016 | BibleHighlight | ✅ aplicada |
| 0017 | UserPrivacySettings, ConsentLog, UserProximityConfig, UserVisibilityConfig | ✅ aplicada |
| 0018 | HospitalityWindow | ✅ aplicada |
| 0019 | communityId em Cell | ✅ aplicada |
| 0020 | ReadingPlanProgress | ✅ aplicada |
| 0021 | Novos campos CellGuide (formato PIB: sermonTitle, preacher, leaderNote, icebreakerTitle, introduction, studyPoints, conclusion, evangelism, evangelismStory, evangelismChallenge) | ✅ aplicada |

---

## 3. O que ainda falta implementar

### Prioridade ALTA
- [ ] **Botão "Estou disponível agora" no Mapa** — publicar Janela de Hospitalidade direto do mapa
- [ ] **Configuração de proximidade na tela de Perfil** — UI para configurar raio e horários (API já existe em `/api/users/proximity-config`)
- [ ] **PWA ícones** — criar `public/images/icon-192.png` e `icon-512.png` para instalação como PWA

### Prioridade MÉDIA
- [ ] **Círculos de Confiança** — quem vê localização exata vs. só bairro
- [ ] **Múltiplos pontos de localização** — casa, trabalho, igreja configuráveis
- [ ] **Push notifications** — notificações reais quando receber visita/alerta (`api/push/subscribe` existe)
- [ ] **Irmão Indica Irmão** — exibir recomendadores no card de empresa em Negócios
- [ ] **Modo noturno + tamanho de fonte** no leitor bíblico

### Prioridade BAIXA (futuro)
- [ ] **Troca de Talentos** — ofertas de ajuda não-monetária
- [ ] **Gamificação** — badges por visitas e ajudas
- [ ] **Missões automáticas** — "Dona Rosa não recebe visitas há 2 semanas"
- [ ] **Dashboard do Líder** — frequência, inativos, aniversariantes, relatório PDF
- [ ] **Versículo do dia compartilhável** como imagem (Vercel OG)

---

## 4. Padrões Técnicos Importantes

### AI SDK v6 — useChat no cliente
```typescript
// CORRETO (v3 API)
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: '/api/teos' }),
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
- `vercel --prod` faz deploy manual (GitHub push deve triggar automaticamente mas às vezes falha)
- Migrações rodam automaticamente no build (`tsx lib/db/migrate && next build`)
- Cron de proximidade: `0 8 * * *` (diário às 8h — limite do plano Hobby)

---

## 5. Arquivos Críticos de Referência

| Arquivo | Função |
|---|---|
| `lib/db/schema.ts` | Schema completo de todas as tabelas |
| `lib/types.ts` | Todos os tipos TypeScript da aplicação |
| `lib/db/queries.ts` | Queries de usuário, sessão, visitas, proximidade |
| `lib/db/queries-cells.ts` | Queries de células, reuniões, guias, orações |
| `lib/ai/prompts.ts` | Todos os prompts: Teos, teosWithPassage, pastoral, generateGuide |
| `lib/reading-plans.ts` | 3 planos de leitura estáticos (Salmos, NT90, Bíblia1Ano) |
| `components/citylink-bottom-nav.tsx` | Navegação inferior (5 abas) |
| `app/(citylink)/layout.tsx` | Layout raiz com auth + onboarding redirect |
| `next.config.ts` | Config Next.js com headers e cacheComponents |
| `vercel.json` | Build command + cron schedule |

---

## 6. Navegação Atual (Bottom Nav — 5 abas)

```
[🗺️ Mapa] [📖 Bíblia] [⛪ Igreja] [💬 Chat] [👤 Perfil]
                              ↳ /pib (Grupos, Oração, Pastoral)
```

---

*Atualizado em 2026-07-05 — repositório: github.com/christianrp45/citylink*
