-- =============================================================================
-- Isek.AI — Migration 001: Schema inicial
-- Executa no Supabase SQL Editor (ou via CLI: supabase db push)
-- =============================================================================

-- Habilitar extensão UUID (já vem no Supabase, mas garantindo)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- TABELA: profiles
-- Criada automaticamente via trigger quando um novo usuário faz signup.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        TEXT UNIQUE,
    avatar_url      TEXT,
    mana_balance    INTEGER NOT NULL DEFAULT 0 CHECK (mana_balance >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfil público do usuário, inclui saldo de Mana.';
COMMENT ON COLUMN public.profiles.mana_balance IS 'Saldo de Mana do usuário. Não pode ser negativo.';


-- =============================================================================
-- TABELA: stories
-- Histórias geradas pelo usuário.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.stories (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    subject          TEXT NOT NULL,
    source_text      TEXT NOT NULL,
    generated_story  TEXT NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.stories IS 'Histórias Isekai geradas a partir de conteúdo escolar.';

CREATE INDEX IF NOT EXISTS stories_user_id_idx ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS stories_created_at_idx ON public.stories(created_at DESC);


-- =============================================================================
-- TABELA: mana_transactions
-- Registro de cada crédito ou débito de Mana.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.mana_transactions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount       INTEGER NOT NULL,                          -- positivo = crédito, negativo = débito
    type         TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    description  TEXT NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.mana_transactions IS 'Ledger de Mana: cada linha representa uma movimentação.';

CREATE INDEX IF NOT EXISTS mana_tx_user_id_idx ON public.mana_transactions(user_id);
CREATE INDEX IF NOT EXISTS mana_tx_created_at_idx ON public.mana_transactions(created_at DESC);


-- =============================================================================
-- FUNÇÃO + TRIGGER: auto-criar profile ao signup (com Mana de boas-vindas)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    welcome_mana INTEGER := 100;
BEGIN
    -- Cria o perfil
    INSERT INTO public.profiles (id, username, avatar_url, mana_balance)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        welcome_mana
    );

    -- Registra a transação de boas-vindas
    INSERT INTO public.mana_transactions (user_id, amount, type, description)
    VALUES (NEW.id, welcome_mana, 'credit', 'Bônus de boas-vindas 🎉');

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- FUNÇÃO: updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- FUNÇÃO RPC: decrement_mana
-- Chamada pelo backend para debitar Mana de forma atômica.
-- Falha se o saldo ficar negativo (constraint CHECK garante isso).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.decrement_mana(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET mana_balance = mana_balance - p_amount
    WHERE id = p_user_id;

    -- Se o UPDATE não encontrou o usuário, lança erro
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário % não encontrado.', p_user_id;
    END IF;
END;
$$;


-- =============================================================================
-- FUNÇÃO RPC: credit_mana
-- Usada por webhooks de pagamento para creditar Mana após compra.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.credit_mana(
    p_user_id    UUID,
    p_amount     INTEGER,
    p_description TEXT DEFAULT 'Recarga de Mana'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET mana_balance = mana_balance + p_amount
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário % não encontrado.', p_user_id;
    END IF;

    INSERT INTO public.mana_transactions (user_id, amount, type, description)
    VALUES (p_user_id, p_amount, 'credit', p_description);
END;
$$;
