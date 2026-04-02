# Isek.AI — Project Roadmap

> Plataforma gamificada que transforma conteúdo escolar em histórias de Anime/Isekai.
> Tech Stack: Next.js + Tailwind CSS | Python + FastAPI | Supabase

---

## FASE 0 — Setup & Infraestrutura Base
- [ ] 0.1 Inicializar repositório monorepo (pastas `frontend/` e `backend/`)
- [ ] 0.2 Criar `frontend/` com Next.js 14 (App Router) + Tailwind CSS
- [ ] 0.3 Criar `backend/` com FastAPI + estrutura de pastas (routers, services, models)
- [ ] 0.4 Configurar variáveis de ambiente (`.env.example` para ambos)
- [ ] 0.5 Criar `docker-compose.yml` para rodar frontend + backend localmente
- [ ] 0.6 Configurar projeto no Supabase (criar projeto, obter URL e ANON KEY)

---

## FASE 1 — Banco de Dados & Auth (Supabase)
- [ ] 1.1 Criar tabela `profiles` (id, username, avatar_url, mana_balance, created_at)
- [ ] 1.2 Criar tabela `stories` (id, user_id, title, source_text, generated_story, subject, created_at)
- [ ] 1.3 Criar tabela `mana_transactions` (id, user_id, amount, type [credit/debit], description, created_at)
- [ ] 1.4 Configurar Row Level Security (RLS) em todas as tabelas
- [ ] 1.5 Criar trigger para auto-criar `profile` quando novo usuário se registra (com 100 Mana de boas-vindas)
- [ ] 1.6 Configurar Auth no Supabase (Email/Password + Google OAuth)

---

## FASE 2 — Backend FastAPI (Motor de IA)
- [ ] 2.1 Setup do projeto FastAPI com dependências (pdfplumber, openai/anthropic, supabase-py, python-multipart)
- [ ] 2.2 Endpoint `POST /api/extract-text` — recebe PDF e retorna texto extraído
- [ ] 2.3 Serviço de construção de prompt (`prompt_builder.py`) — monta o prompt Isekai otimizado
- [ ] 2.4 Serviço de geração de história (`story_service.py`) — chama a LLM (Claude/GPT) e retorna história
- [ ] 2.5 Endpoint `POST /api/generate-story` — orquestra extração + geração + salva no Supabase
- [ ] 2.6 Endpoint `GET /api/stories/{user_id}` — lista histórias do usuário
- [ ] 2.7 Middleware de autenticação (valida JWT do Supabase)
- [ ] 2.8 Lógica de consumo de Mana (verificar saldo, debitar, registrar transação)
- [ ] 2.9 Testes básicos dos endpoints

---

## FASE 3 — Frontend Next.js (Interface Gamificada)
- [ ] 3.1 Layout base gamificado: tema escuro, fontes estilizadas, paleta de cores anime (roxo/azul néon/dourado)
- [ ] 3.2 Página de Landing (`/`) — hero section, CTA, descrição do produto
- [ ] 3.3 Página de Auth (`/auth`) — tela de login/registro com visual de "Tela de Status" de RPG
- [ ] 3.4 Componente `ManaBar` — exibe saldo de Mana do usuário (barra animada)
- [ ] 3.5 Dashboard (`/dashboard`) — área principal do herói com histórico de histórias
- [ ] 3.6 Página de Upload (`/generate`) — form para colar texto ou fazer upload de PDF
- [ ] 3.7 Página de Resultado (`/story/[id]`) — exibe a história gerada com efeitos visuais
- [ ] 3.8 Integração Supabase Auth no frontend (login, logout, sessão persistente)
- [ ] 3.9 Integração com API FastAPI (chamadas para geração de histórias)
- [ ] 3.10 Loading states gamificados ("Invocando o Isekai...", barra de progresso mágica)
- [ ] 3.11 Página de configurações/perfil (`/profile`)

---

## FASE 4 — Monetização (Sistema de Mana)
- [ ] 4.1 Definir planos: Free (100 Mana/mês), Pro (1000 Mana/mês)
- [ ] 4.2 Custo por geração: 10 Mana por história
- [ ] 4.3 Integrar Stripe para planos pagos
- [ ] 4.4 Webhook Stripe → Supabase para creditar Mana após pagamento
- [ ] 4.5 Página de pricing/upgrade (`/upgrade`)

---

## FASE 5 — Integração Final & Deploy
- [ ] 5.1 Testes end-to-end do fluxo completo (upload → geração → exibição)
- [ ] 5.2 Deploy do backend FastAPI (Railway ou Render)
- [ ] 5.3 Deploy do frontend (Vercel)
- [ ] 5.4 Configurar variáveis de ambiente em produção
- [ ] 5.5 Smoke tests em produção

---

## Ordem de Execução Recomendada
```
FASE 0 → FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5
```
