import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'
import { ArrowLeft, BookOpen, Clock, Swords } from 'lucide-react'

export const metadata = { title: 'Isek.AI — Suas Histórias' }

export default async function StoriesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, mana_balance')
    .eq('id', user.id)
    .single()

  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, subject, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const username = profile?.username ?? user.email?.split('@')[0] ?? 'Herói'
  const manaBalance = profile?.mana_balance ?? 0
  const total = stories?.length ?? 0

  return (
    <>
      <Navbar username={username} manaBalance={manaBalance} />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-mana-500 hover:text-mana-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar ao Painel
          </Link>
          <Link href="/generate" className="btn-ghost text-sm py-2 px-4 flex items-center gap-1.5">
            <Swords size={14} />
            Nova Aventura
          </Link>
        </div>

        <div>
          <h1 className="font-display text-2xl font-black text-white flex items-center gap-2 md:text-3xl">
            <BookOpen size={24} className="text-mana-500" />
            Grimório de Aventuras
          </h1>
          <p className="mt-1 text-sm text-mana-500">
            {total === 0
              ? 'Nenhuma história registrada ainda.'
              : `${total} ${total === 1 ? 'história registrada' : 'histórias registradas'} na sua jornada.`}
          </p>
        </div>

        {!stories || stories.length === 0 ? (
          <div className="card-void p-12 text-center">
            <div className="text-4xl mb-3">🗡️</div>
            <p className="text-mana-500 font-semibold">Nenhuma aventura ainda.</p>
            <p className="text-mana-700 text-sm mt-1">Gere sua primeira história e comece a jornada!</p>
            <Link href="/generate" className="btn-mana mt-6 inline-flex items-center gap-2">
              <Swords size={16} />
              Começar Agora
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="card-void-hover p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-mana-500 uppercase tracking-wider">
                    {story.subject}
                  </span>
                  <span className="text-xs text-mana-700 flex items-center gap-1 shrink-0">
                    <Clock size={10} />
                    {new Date(story.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">
                  {story.title}
                </h3>
                <span className="text-xs text-mana-600 mt-auto">Ler história →</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
