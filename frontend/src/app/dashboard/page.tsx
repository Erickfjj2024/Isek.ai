import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'
import ManaBar from '@/components/ui/ManaBar'
import { BookOpen, Swords, Clock } from 'lucide-react'

export const metadata = { title: 'Isek.AI — Painel do Herói' }

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, mana_balance')
    .eq('id', user.id)
    .single()

  // Fetch recent stories (last 6)
  const { data: stories } = await supabase
    .from('stories')
    .select('id, title, subject, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  const username = profile?.username ?? user.email?.split('@')[0] ?? 'Herói'
  const manaBalance = profile?.mana_balance ?? 0

  return (
    <>
      <Navbar username={username} manaBalance={manaBalance} />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Hero greeting */}
        <section className="card-void p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold text-mana-600 uppercase tracking-widest mb-1">
                ⚔️ Status do Herói
              </p>
              <h1 className="font-display text-3xl font-black text-white">
                Bem-vindo, <span className="text-gradient-mana">{username}</span>!
              </h1>
              <p className="mt-2 text-sm text-mana-400">
                Você tem <span className="font-bold text-mana-300">{manaBalance} Mana</span> disponível.
                Cada história custa <strong className="text-white">10 Mana</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-4 min-w-[200px]">
              <ManaBar balance={manaBalance} max={100} size="lg" />
              <Link href="/generate" className="btn-mana text-center flex items-center justify-center gap-2">
                <Swords size={16} />
                Nova Aventura
              </Link>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { icon: '📖', label: 'Histórias Geradas', value: stories?.length ?? 0 },
            { icon: '🔮', label: 'Mana Disponível', value: manaBalance },
            { icon: '⚡', label: 'Custo por História', value: '10 Mana' },
          ].map((stat) => (
            <div key={stat.label} className="card-void p-5 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-mana-600 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Recent stories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-mana-500" />
              Histórias Recentes
            </h2>
            {stories && stories.length > 0 && (
              <Link href="/stories" className="text-xs text-mana-500 hover:text-mana-300 transition-colors">
                Ver todas →
              </Link>
            )}
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
        </section>
      </main>
    </>
  )
}
