# Isek.AI — Checkpoint de Progresso

---

## Status Geral
**Fase Atual:** MVP completo — pronto para deploy (FASE 5) ou monetização (FASE 4)
**Data da Última Atualização:** 2026-07-03

---

## Última Tarefa Concluída
**MVP finalizado** — Fix crítico de auth JWT (backend validava com anon key; agora usa `SUPABASE_JWT_SECRET` + `aud="authenticated"`), auth no `/api/extract-text`, páginas `/stories` e `/profile` (com edição de username e histórico de Mana), suíte de 19 testes pytest, CI GitHub Actions, DEPLOY.md, ajustes de Docker para produção.

---

## Tarefa Atual
Nenhuma em andamento.

---

## Próximo Passo
FASE 4 (Stripe + planos de Mana) ou FASE 5 (executar o deploy seguindo DEPLOY.md)

---

## Progresso por Fase

### FASE 0 — Setup & Infraestrutura Base
- [x] 0.1 Inicializar monorepo (pastas `frontend/` e `backend/`)
- [x] 0.2 Criar frontend Next.js 14 + Tailwind CSS
- [x] 0.3 Criar backend FastAPI + estrutura de pastas
- [x] 0.4 Configurar variáveis de ambiente (`.env.example`) — feito junto com 0.2 e 0.3
- [x] 0.5 Criar `docker-compose.yml`
- [x] 0.6 Configurar projeto no Supabase

### FASE 1 — Banco de Dados & Auth
- [x] 1.1 Tabela `profiles` (id, username, avatar_url, mana_balance, created_at)
- [x] 1.2 Tabela `stories` (id, user_id, title, source_text, generated_story, subject, created_at)
- [x] 1.3 Tabela `mana_transactions` (id, user_id, amount, type, description, created_at)
- [x] 1.4 Row Level Security (RLS) em todas as tabelas
- [x] 1.5 Trigger `on_auth_user_created` + 100 Mana de boas-vindas
- [x] 1.6 Funções RPC: `decrement_mana`, `credit_mana`, `set_updated_at`

### FASE 2 — Backend FastAPI
- [ ] Aguardando FASE 1

### FASE 3 — Frontend Next.js
- [x] 3.1 Layout base gamificado (globals.css, tailwind tema)
- [x] 3.2 Landing page (/)
- [x] 3.3 Página de Auth (/auth) — login/registro visual RPG
- [x] 3.4 Componente ManaBar (barra animada com estados danger/low)
- [x] 3.5 Dashboard (/dashboard) — painel do herói, stats, histórias recentes
- [x] 3.6 Página de Upload (/generate) — texto ou PDF, seleção de matéria
- [x] 3.7 Página de Resultado (/story/[id]) — StoryViewer com seções
- [x] 3.8 Integração Supabase Auth (client, server, middleware de proteção de rotas)
- [x] 3.9 Integração com API FastAPI (fetch autenticado no GenerateForm)
- [x] 3.10 Loading states gamificados ("Invocando o mundo Isekai...")
- [x] 3.11 Página de perfil (/profile) — com edição de username e histórico de Mana
- [x] Extra: página /stories (lista completa) + link de perfil no Navbar
- [x] Extra: suíte de testes do backend (19 testes) + CI GitHub Actions
- [x] Extra: fix do bug de validação JWT + auth no /api/extract-text

### FASE 4 — Monetização
- [ ] Aguardando FASE 3

### FASE 5 — Deploy
- [x] 5.1 (parcial) Validação local: 19 testes pytest + lint + build de produção do Next.js + smoke test `/health`
- [x] 5.2 Config de deploy do backend — `render.yaml` (Render Blueprint) + Dockerfile com `$PORT` dinâmico
- [x] 5.3 Config de deploy do frontend — `vercel.json` + `public/` exigido pelo Docker build
- [x] 5.4 Variáveis de produção documentadas (`DEPLOY.md` + Blueprint)
- [x] 5.1 (auth E2E) JWT secret do projeto de teste validado localmente: 403 sem token,
      401 com token inválido, 200 + extração de PDF com token assinado pelo secret real
- [ ] 5.5 Deploy manual nos dashboards (Render Blueprint + Vercel) e smoke tests em produção
      (todas as credenciais de teste disponíveis — valores em `backend/.env` local)

---

## Anotações / Bugs / Decisões Técnicas
- Projeto iniciado com monorepo simples (sem Turborepo por ora, manter simples)
- LLM: Groq ou Gemini via API compatível com OpenAI, selecionado por `LLM_PROVIDER` (padrão: groq)
- Custo de Mana por geração: 10 unidades
- Mana inicial de boas-vindas: 100 unidades (trigger no Supabase)
- Supabase será usado tanto para Auth quanto para DB (evitar complexidade extra)

---

## Credenciais / Variáveis Necessárias (a preencher)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
LLM_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```
