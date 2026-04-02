-- =============================================================================
-- Isek.AI — Seed: dados de exemplo para desenvolvimento local
-- NÃO executar em produção.
-- =============================================================================

-- Usuário de teste (precisa existir em auth.users antes — crie via Supabase Auth UI)
-- Substitua o UUID pelo ID real do usuário de teste criado no dashboard

DO $$
DECLARE
    test_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- trocar pelo ID real
BEGIN
    -- Inserir perfil de teste (caso o trigger não tenha rodado)
    INSERT INTO public.profiles (id, username, mana_balance)
    VALUES (test_user_id, 'heroi_teste', 200)
    ON CONFLICT (id) DO NOTHING;

    -- Inserir história de exemplo
    INSERT INTO public.stories (user_id, title, subject, source_text, generated_story)
    VALUES (
        test_user_id,
        'A Saga do Herói da Fotossíntese',
        'Biologia',
        'A fotossíntese é o processo pelo qual plantas convertem luz solar em energia química...',
        '## Capítulo 1: O Mundo de Clorofília\n\nVocê abriu os olhos em um mundo verde-neon...'
    )
    ON CONFLICT DO NOTHING;
END $$;
