-- =============================================================================
-- Isek.AI — Migration 002: Row Level Security (RLS)
-- Garante que cada usuário acessa APENAS seus próprios dados.
-- =============================================================================


-- =============================================================================
-- profiles
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seu próprio perfil
CREATE POLICY "profiles: select own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuário atualiza apenas seu próprio perfil
CREATE POLICY "profiles: update own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT é feito APENAS pelo trigger handle_new_user (SECURITY DEFINER)
-- Usuários normais não podem inserir diretamente
CREATE POLICY "profiles: no direct insert"
    ON public.profiles FOR INSERT
    WITH CHECK (false);


-- =============================================================================
-- stories
-- =============================================================================
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Usuário lê apenas suas histórias
CREATE POLICY "stories: select own"
    ON public.stories FOR SELECT
    USING (auth.uid() = user_id);

-- Backend insere histórias usando service_role_key (bypassa RLS)
-- Usuários autenticados também podem inserir suas próprias histórias
CREATE POLICY "stories: insert own"
    ON public.stories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuário não pode alterar histórias geradas
CREATE POLICY "stories: no update"
    ON public.stories FOR UPDATE
    USING (false);

-- Usuário pode deletar suas próprias histórias
CREATE POLICY "stories: delete own"
    ON public.stories FOR DELETE
    USING (auth.uid() = user_id);


-- =============================================================================
-- mana_transactions
-- =============================================================================
ALTER TABLE public.mana_transactions ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas suas próprias transações (somente leitura)
CREATE POLICY "mana_tx: select own"
    ON public.mana_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT é feito via SECURITY DEFINER functions (handle_new_user, credit_mana)
-- e pelo backend via service_role_key — usuários não inserem diretamente
CREATE POLICY "mana_tx: no direct insert"
    ON public.mana_transactions FOR INSERT
    WITH CHECK (false);

-- Transações são imutáveis
CREATE POLICY "mana_tx: no update"
    ON public.mana_transactions FOR UPDATE
    USING (false);

CREATE POLICY "mana_tx: no delete"
    ON public.mana_transactions FOR DELETE
    USING (false);
