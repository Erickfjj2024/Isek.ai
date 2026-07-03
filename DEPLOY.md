# Isek.AI — Guia de Deploy

Stack de produção recomendada:

| Camada   | Serviço            |
|----------|--------------------|
| Frontend | Vercel             |
| Backend  | Railway ou Render  |
| DB/Auth  | Supabase           |

> **Ordem importa:** deploy do backend primeiro (com `ALLOWED_ORIGINS` provisório),
> depois o frontend no Vercel, e por fim atualize `ALLOWED_ORIGINS` com a URL real do Vercel.

---

## 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute na ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   (ou use `supabase db push` com a CLI.)
3. Em **Settings → API**, copie:
   - **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca exponha no frontend)
   - **JWT Secret** → `SUPABASE_JWT_SECRET` (usado pelo backend para validar tokens)
4. Em **Authentication → Providers**, confirme que **Email** está habilitado.
5. Teste o trigger de boas-vindas: crie um usuário de teste e verifique que
   `profiles.mana_balance = 100` e que existe uma transação de crédito em `mana_transactions`.

## 2. Backend (Railway ou Render)

- **Railway**: New Project → Deploy from GitHub → selecione o repo, root directory `backend/`
  (o `Dockerfile` é detectado automaticamente).
- **Render**: New Web Service → root directory `backend/`, runtime Docker,
  ou start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

Variáveis de ambiente:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `SUPABASE_JWT_SECRET` | JWT Secret (Settings → API) |
| `ANTHROPIC_API_KEY` | chave da API Anthropic |
| `LLM_MODEL` | `claude-sonnet-4-6` (ou outro) |
| `APP_ENV` | `production` (desativa `/docs` e `/redoc`) |
| `SECRET_KEY` | `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | `https://SEU-APP.vercel.app` (separar múltiplas por vírgula) |
| `MANA_COST_PER_STORY` | `10` |
| `MANA_WELCOME_BONUS` | `100` |

Após o deploy, anote a URL pública do backend (ex.: `https://isek-backend.up.railway.app`).

## 3. Frontend (Vercel)

1. Import Project → selecione o repo → **Root Directory: `frontend/`** (framework Next.js detectado).
2. Variáveis de ambiente:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `NEXT_PUBLIC_API_URL` | URL pública do backend (passo 2) |

3. Deploy. Anote a URL final (ex.: `https://isek-ai.vercel.app`).
4. **Volte ao backend** e atualize `ALLOWED_ORIGINS` com essa URL (senão o navegador bloqueia por CORS).

## 4. Checklist pós-deploy

- [ ] `GET https://<backend>/health` retorna 200
- [ ] `https://<backend>/docs` retorna 404 (confirma `APP_ENV=production`)
- [ ] Cadastro de usuário → dashboard mostra **100 Mana**
- [ ] Upload de PDF em `/generate` extrai o texto
- [ ] Geração de história funciona e o saldo cai para **90 Mana**
- [ ] A história aparece em `/stories` e a transação de −10 em `/profile`
- [ ] Console do navegador sem erros de CORS

## Docker local (produção simulada)

```bash
# Backend: preencha backend/.env (ver backend/.env.example)
# Frontend: preencha frontend/.env.local (ver frontend/.env.example)
docker compose up --build
```

Para desenvolvimento com hot-reload use `docker compose -f docker-compose.dev.yml up`.
