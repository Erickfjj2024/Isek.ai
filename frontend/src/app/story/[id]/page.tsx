import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'
import StoryViewer from './StoryViewer'
import { ArrowLeft, Swords } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('stories').select('title').eq('id', id).single()
  return { title: data ? `${data.title} — Isek.AI` : 'História — Isek.AI' }
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, mana_balance')
    .eq('id', user.id)
    .single()

  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!story) notFound()

  const username = profile?.username ?? user.email?.split('@')[0] ?? 'Herói'
  const manaBalance = profile?.mana_balance ?? 0

  return (
    <>
      <Navbar username={username} manaBalance={manaBalance} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Story header */}
        <div className="card-void p-6 mb-6">
          <p className="text-xs font-bold text-mana-600 uppercase tracking-widest mb-1">
            {story.subject}
          </p>
          <h1 className="font-display text-2xl font-black text-white md:text-3xl">
            {story.title}
          </h1>
          <p className="mt-2 text-xs text-mana-700">
            Gerada em {new Date(story.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Story content */}
        <StoryViewer content={story.generated_story} />
      </main>
    </>
  )
}
