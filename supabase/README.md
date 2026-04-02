# Supabase — Setup Guide

## Como aplicar as migrations

### Opção 1: SQL Editor (mais rápida para começar)
1. Acesse o dashboard do seu projeto Supabase
2. Vá em **SQL Editor**
3. Execute os arquivos na ordem:
   - `migrations/001_initial_schema.sql`
   - `migrations/002_rls_policies.sql`
4. Opcionalmente execute `seed.sql` para dados de teste (dev only)

### Opção 2: Supabase CLI
```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar ao projeto
supabase link --project-ref YOUR_PROJECT_REF

# Aplicar migrations
supabase db push
```

## Variáveis necessárias
Após criar o projeto Supabase, copie as chaves em **Project Settings → API**:

| Variável | Onde encontrar |
|---|---|
| `SUPABASE_URL` | Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role (manter secreto!) |

## Auth — Provedores recomendados
Em **Authentication → Providers**:
- Email/Password: ✅ Habilitar
- Google OAuth: ✅ Habilitar (opcional, mas recomendado)

## Checklist pós-setup
- [ ] Migrations 001 e 002 aplicadas sem erros
- [ ] Trigger `on_auth_user_created` visível em Database → Functions
- [ ] Função `decrement_mana` visível em Database → Functions
- [ ] RLS habilitado nas 3 tabelas (ícone de cadeado no Table Editor)
- [ ] Criar usuário de teste via Authentication → Users
- [ ] Confirmar que o perfil foi criado automaticamente com 100 Mana
