# Isek.AI — Checkpoint de Progresso

---

## Status Geral
**Fase Atual:** FASE 0 — Setup & Infraestrutura Base
**Data da Última Atualização:** 2026-04-02

---

## Última Tarefa Concluída
**FASE 1 completa** — Migrations SQL do Supabase: schema, RLS, triggers e funções RPC criados.

---

## Tarefa Atual
**FASE 2 — Tarefa 2.1** — Verificar e finalizar o backend FastAPI (todas as dependências, testes)

---

## Próximo Passo
**FASE 3 — Tarefa 3.1** — Iniciar as páginas do frontend: Auth, Dashboard, Generate, Story

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
- [ ] Aguardando FASE 2

### FASE 4 — Monetização
- [ ] Aguardando FASE 3

### FASE 5 — Deploy
- [ ] Aguardando FASE 4

---

## Anotações / Bugs / Decisões Técnicas
- Projeto iniciado com monorepo simples (sem Turborepo por ora, manter simples)
- LLM a definir: Claude (Anthropic) é preferível dado o contexto; configurar via variável de ambiente `LLM_PROVIDER`
- Custo de Mana por geração: 10 unidades
- Mana inicial de boas-vindas: 100 unidades (trigger no Supabase)
- Supabase será usado tanto para Auth quanto para DB (evitar complexidade extra)

---

## Credenciais / Variáveis Necessárias (a preencher)
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LLM_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```
